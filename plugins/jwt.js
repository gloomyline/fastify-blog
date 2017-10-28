/*
* @Author: Alan
* @Date:   2017-10-28 09:52:46
* @Last Modified by:   Alan
* @Last Modified time: 2017-10-28 11:21:07
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
      return new Promise((resolve, reject) => {
        JWT.sign(payload, secret, opts, (err, token) => {
          if (err) {
            reject(err)
          } else {
            resolve(token)
          }
        })
      })
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
      return new Promise((resolve, reject) => {
        JWT.verify(token, secret, opts, (err, decoded) => {
          if (err) {
            reject(err)
          } else {
            resolve(decoded)
          }
        })
      })
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

module.exports = fp(aJWT, '>=0.30.2')