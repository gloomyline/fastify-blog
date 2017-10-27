/*
* @Author: AlanWang
* @Date:   2017-10-24 10:46:48
* @Last Modified by:   AlanWang
* @Last Modified time: 2017-10-27 16:00:43
*/

'use strict'
const log = require('pino')({ level: 'info', prettyPrint: true })
const Fastify = require('fastify')

function build(opts) {
  const fastify = Fastify(opts)

  fastify.register(require('fastify-jwt'), { secret: 'supersecret' })
    .register(require('fastify-mongodb'), { url: 'mongodb://localhost:27017/blog-system' })
    .register(require('fastify-auth'))
    .after(routes)

  fastify.decorate('verifyJWTandMongo', (request, reply, done) => {
    const jwt = fastify.jwt
    const mongo = fastify.mongo
    const token = request.req.headers['authorization']
    if (!token) {
      done(new Error('Missing token header'))
    }

    jwt.verify(token, (err, decoded) => {
      if (err || !decoded.user || !decoded.pwd) {
        return done(new Error('Token invalid, jwt verificated is not passed'))
      }

      mongo.db.collection('users').findOne({ user: decoded.user }, { fields: { pwd: 1 } }, (err, data) => {
        if (err) {
          if (err.notFound) {
            return done(new Error('Token invalid, does not have the user'))
          }
          return done(err)
        }

        if (!data.pwd || data.pwd !== decoded.pwd) {
          return done(new Error('Token invalid, password is not correct'))
        }

        request.log.info('User authorized')
        done()
      })
    })
  })

  fastify.decorate('verifyUserAndPwd', (request, reply, done) => {
    const users = fastify.mongo.db.collection('users')
    users.findOne({ user: request.body.user }, (err, data) => {
      if (err) {
        if (err.notFound) {
          return done(new Error('User does not exsit'))
        }
        return done(err)
      }

      if (!data.pwd || data.pwd !== request.body.pwd) {
        return done(new Error('Password is not correct'))
      }

      done()
    })
  })

  function routes() {
    const db = fastify.mongo.db

    fastify.post('/register', {
      schema: {
        body: {
          type: 'object',
          properties: {
            user: { type: 'string' },
            pwd: { type: 'string' }
          },
          required: ['user', 'pwd']
        }
      }
    }, (request, reply) => {
      request.log.info('Creating new user')
      db.collection('users', (err, col) => { // on open collection user in db blog-system
        if (err) return reply.send(err)

        fastify.jwt.sign(request.body, (err, token) => { // on generate token
          if (err) return reply.send(err)

          col.insertOne({ user: request.body.user, pwd: request.body.pwd, token}, (err) => { // on insert
            if (err) return reply.send(err)
            request.log.info('User created')
            reply.send({ token })
          })   
        })
      })
    })

    fastify.get('/auth', {
      beforeHandler: fastify.auth([
        fastify.verifyJWTandMongo,
        fastify.verifyUserAndPwd
      ])
    }, (request, reply) => {
      request.log.info('Auth route')
      reply.send({ hello: 'world' })
    })

    fastify.get('/no-auth', {}, (request, reply) => {
      request.log.info('Auth free route')
      reply.send({ hello: 'world' })
    })
  }

  return fastify
}


if (require.main === module) {
  const fastify = build({ logger: log })
  fastify.listen(3000, err => {
    if (err) throw err
    console.log(`server listening on ${fastify.server.address().port}`)
  })  
}


