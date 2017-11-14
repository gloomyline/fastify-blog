/*
* @Author: AlanWang
* @Date:   2017-10-24 10:46:48
* @Last Modified by:   Alan
* @Last Modified time: 2017-11-14 14:16:29
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
    .register(require('./plugins/authentication'))
    .register(require('./routes')) 

  return fastify
}


if (require.main === module) {
  const fastify = build({ logger: log })
  fastify.listen(3000, err => {
    if (err) throw err
    console.log(`server listening on ${fastify.server.address().port}`)
  })  
}


