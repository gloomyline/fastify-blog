/*
* @Author: AlanWang
* @Date:   2017-10-27 09:25:24
* @Last Modified by:   AlanWang
* @Last Modified time: 2017-10-27 13:34:00
*/

const Fastify = require('fastify')

function build (opts) {
  const fastify = Fastify(opts)

  fastify.register(require('fastify-jwt'), { secret: 'supersecret'})
    .register(require('fastify-leveldb'), { name: 'authdb'})
    .register(require('fastify-auth'))
    .after(routes)

  fastify.decorate('verifyJWTandLevel', onVerifyJWTandLevel)
  fastify.decorate('verifyUserAndPassword', onVerifyUserAndPassword)

  function onVerifyJWTandLevel (request, reply, done) {
    const jwt = this.jwt
    const level = this.level
    if (!request.req.headers['auth']) {
      return done(new Error('Missing token header'))
    }

    jwt.verify(request.req.headers['auth'], (err, decoded) => { // on verify
      if (err || !decoded.user || !decoded.password) {
        return done(new Error('Token not valid, jwt verification is not passed'))
      }
      level.get(decoded.user, (err, password) => { // on get user from level
        if (err) {
          if (err.notFound) {
            return done(new Error('Token not valid, does not has the user'))
          }
          return done(err)
        }

        if (!password || password !== decoded.password) {
          return done(new Error('Token not valid, password if not correct'))
        }

        done()
      })
    })
  }

  function onVerifyUserAndPassword (request, reply, done) {
    const level = this.level
    level.get(request.body.user, (err, password) => { // on get user from level
      if (err) {
        if (err.notFound) {
          return done(new Error('Password not valid'))
        }
        return done(err)
      }

      if (!password || password !== request.body.password) {
        return done(new Error('Password not valid'))
      }

      done()
    })
  }

  function routes () {
    fastify.post('/register', {
      schema: {
        body: {
          type: 'object',
          properties: {
            user: { type: 'string' },
            password: { type: 'string' }
          },
          required: ['user', 'password']
        }
      }
    }, (request, reply) => {
      request.log.info('creating new user')
      fastify.level.put(request.body.user, request.body.password, (err) => { // on level db put
        if (err) return reply.send(err)
        fastify.jwt.sign(request.body, (err, token) => { // on jwt sign
          if (err) return reply.send(err)
          request.log.info('user created')
          reply.send({ token })
        })
      })
    })

    fastify.get('/no-auth', {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              hello: { type: 'string' }
            }
          }
        }
      }
    }, (request, reply) => {
      request.log.info('auth free route')
      reply.send({ hello: 'world' })
    })

    fastify.get('/auth', {
      beforeHandler: fastify.auth([
        fastify.verifyJWTandLevel
      ])
    }, (request, reply) => {
      request.log.info('auth route')
      reply.send({ hello: 'world' })
    })

    fastify.post('/auth-multiple', {
      beforeHandler: fastify.auth([
        fastify.verifyJWTandLevel,
        fastify.verifyUserAndPassword
      ])
    }, (request, reply) => {
      request.log.info('auth route multiplely')
      reply.send({ hello: 'world' })
    })
  }

  return fastify
}

if (require.main === module) {
  const fastify = build({
    logger: { level: 'info' }
  })
  fastify.listen(3000, err => {
    if (err) throw err
    console.log(`Server is running on ${fastify.server.address().port}`)
  })
}
