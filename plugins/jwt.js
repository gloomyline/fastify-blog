/*
* @Author: Alan
* @Date:   2017-10-28 09:52:46
* @Last Modified by:   Alan
* @Last Modified time: 2017-10-30 14:35:48
*/

/**
 *  comments: plugin to encode user's account in fastify powered by 'jsonwebtoken'
 *  extra: it supports async/await
 *  @param {Fastify} fasify instance of Fastify
 *  @param {Object} opts optional config
 *  @param {Function} next 
 */

const fp = require('fastify-plugin')
const JWT = require('jsonwebtoken')
const assert = require('assert')

function aJWT (fastify, opts, next) {
  if (!opts.secret) {
    return new Error('Missing secret')
  }

  const secret = opts.secret
  
  /**
   * generate json token
   * @param  {Object}               payload Object need to generate token
   * @param  {Object || Function}   opts    optional or callback
   * @param  {Function} cb          callback
   * @return {null || Promise}
   */
  function sign (payload, opts, cb) {
    assert(payload, 'Missing payload!')
    opts = opts || {}

    if (typeof opts === 'function') {
      cb = opts
      opts = {}
    }

    if (typeof cb === 'function') {
      JWT.sign(payload, secret, opts, cb)
    } else {
      let sign = fastify.utils.promisify(JWT.sign)
      return sign(payload, secret, opts)
    }
  }
  
  /**
   * verify token is valid
   * @param  {String}   token token string
   * @param  {Object}   opts  optinal or callback  
   * @param  {Function} cb    callback
   * @return {null || Promise}
   */
  function verify (token, opts, cb) {
    assert(token, 'Missing token!')
    assert(secret, 'missing secret')
    opts = opts || {}

    if (typeof opts === 'function') {
      cb = opts
      opts = {}
    }

    if (typeof cb === 'function') {
      JWT.verify(token, secret, opts, cb)
    } else {
      let verify = fastify.utils.promisify(JWT.verify)
      return verify(token, secret, opts)
    }
  }
  
  /**
   * decode token without verifing the signature
   * @param  {String} token token string
   * @param  {Object} opts  optianal
   * @return {payload}      decoded payload
   */
  function decode (token, opts) {
    assert(token, 'Missing token!')
    opts = opts || {}
    return JWT.decode(token, opts)
  }

  fastify.decorate('jwt', {
    sign,
    verify,
    decode,
    secret
  })

  next()
}

module.exports = fp(aJWT, require('./config').fv)