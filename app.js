/*
* @Author: AlanWang
* @Date:   2017-10-24 10:46:48
* @Last Modified by:   Alan
* @Last Modified time: 2017-10-30 17:45:15
*/

'use strict'
const log = require('pino')({ level: 'info', prettyPrint: true })
const Fastify = require('fastify')

function build(opts) {
  const fastify = Fastify(opts)

  fastify
    .register(require('./plugins/utils'))
    .register(require('./plugins/jwt'), { secret: 'supersecret' })
    .register(require('fastify-mongodb'), { url: 'mongodb://localhost:27017/blog-system' })
    .register(require('fastify-auth'))
    .register(require('./routes'))

  fastify.decorate('verifyJWTandMongo', async (request, reply, done) => {
    const jwt = fastify.jwt
    const mongo = fastify.mongo
    const token = request.req.headers['authorization']
    if (!token) {
      done(new Error('Missing token header'))
    }

    let decoded = await jwt.verify(token)
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

  return fastify
}


if (require.main === module) {
  const fastify = build({ logger: log })
  fastify.listen(3000, err => {
    if (err) throw err
    console.log(`server listening on ${fastify.server.address().port}`)
  })  
}


