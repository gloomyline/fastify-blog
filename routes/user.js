/*
* @Author: AlanWang
* @Date:   2017-10-30 17:47:07
* @Last Modified by:   AlanWang
* @Last Modified time: 2017-10-30 17:56:10
*/

function userRoutes(opts, next) {
  const db = this.mongo.db

  this.post('/register', {
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
    db.collection('users', async (err, col) => { // on open collection user in db blog-system
      if (err) return reply.send(err)
      let token = await this.jwt.sign(request.body)
      col.insertOne({ user: request.body.user, pwd: request.body.pwd, token}, (err) => { // on insert
        if (err) return reply.send(err)
        request.log.info('User created')
        reply.send({ token })
      })   
    })
  })

  this.get('/auth', {
    beforeHandler: this.auth([
      this.verifyJWTandMongo,
      this.verifyUserAndPwd
    ])
  }, (request, reply) => {
    request.log.info('Auth route')
    reply.send({ hello: 'world' })
  })

  this.get('/no-auth', {}, (request, reply) => {
    request.log.info('Auth free route')
    reply.send({ hello: 'world' })
  })

  next()
}

module.exports = userRoutes