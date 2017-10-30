/*
* @Author: AlanWang
* @Date:   2017-10-30 17:19:36
* @Last Modified by:   AlanWang
* @Last Modified time: 2017-10-30 17:54:51
*/

const fp = require('fastify-plugin')
const series = require('fastseries')()

// routes
const user = require('./user')

function routes(fastify, opts, next) {
  series(fastify, [
    user
  ], opts, next)
}

module.exports = fp(routes, require('../plugins/config').fv)