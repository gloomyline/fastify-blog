/*
* @Author: Administrator
* @Date:   2017-10-25 23:37:56
* @Last Modified by:   Administrator
* @Last Modified time: 2017-10-26 00:03:30
*/

const log = require('pino')({
  level: 'info',
  prettyPrint: true
})
const fastify = require('fastify')({
  logger: log
})

const opts = {
  schema: {
    200: {
      type: 'object',
      properties: {
        hello: {
          type: 'string'
        }
      }
    }
  },
  beforeHandler: (request, reply, done) => {
    request.log.info('authen here for route "/"')
    done()
  }
}

fastify.addHook('preHandler', (request, reply, done) => {
  request.log.info('pre handle here')
  done()
})

fastify.get('/', opts, (request, reply) => {
  request.log.info('handle here')
  reply.code(200).type('application/json').send({ hello: 'world' })
})

fastify.listen(3000, (err) => {
  if (err) throw err
  console.log(`Server is running on port ${fastify.server.address().port}`)
})