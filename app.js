/*
* @Author: AlanWang
* @Date:   2017-10-24 10:46:48
* @Last Modified by:   AlanWang
* @Last Modified time: 2017-10-25 15:57:52
*/

'use strict'
const log = require('pino')({ level: 'info' })
const fastify = require('fastify')({ logger: log })

log.info('does not have req info')

const opts = {
  schema: { // Schema serialization
    response: {
      200: {
        type: 'object',
        properties: {
          hello: {
            type: 'string'
          }
        }
      }
    },
    beforeHandler: [ // for authenticating on the route level
      function first (req, rep, done) {
        req.log.info('first')
        done()
      },
      function second (req, rep, done) {
        req.log.info('second')
        done()
      }
    ]
  }
}

fastify.addHook('preHandler', (req, rep, done) => {
  req.log.info('authen on hook level')
  done()
})

fastify.get('/', opts, async (req, rep) => {
  let processed = await doSthAsynchronously()
  req.log.info('log some infos of req, the same instance as the log')
  rep.send({hello: `word${processed}`})
})

fastify.listen(3000, err => {
  if (err) throw err
  console.log(`server listening on ${fastify.server.address().port}`)
})

let count = 0
function doSthAsynchronously () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      log.info('simulate asynchronous operation here')
      resolve(++count)
    }, 3000)
  })
}