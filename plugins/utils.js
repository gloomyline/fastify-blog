/*
* @Author: AlanWang
* @Date:   2017-10-30 13:09:28
* @Last Modified by:   AlanWang
* @Last Modified time: 2017-10-30 14:18:27
*/

'use strict'

const fp = require('fastify-plugin')
const Promise = require('bluebird')

function declareUtils (fastify, opts, next) {

  /**
   * Instead of taking a callback, 
   * the returned function will return a promise whose fate is 
   * decided by the callback behavior of the given node function
   * Note: The node function should conform to 
   * node.js convention of accepting a callback as last argument 
   * and calling that callback with error as the first argument 
   * and success value on the second argument.
   * @param  {Function} func [nodeFunction, it will receive any arguments, include callback with error which is needed]
   * @param  {Object{multiArgs: boolean=false, context: any=this}} opts [Setting multiArgs to true means the resulting promise will always fulfill with an array of the callback's success value(s).If you pass a context, the nodeFunction will be called as a method on the context.]
   * @return {Function}      [a function that will wrap the given nodeFunction]
   *
   * @prefrence http://bluebirdjs.com/docs/api/promise.promisify.html
   */
  function promisify (func, opts) {
    if (typeof func !== 'function') {
      throw new Error(`The first argument need to be a function, but got ${typeof func}`)
    }

    return Promise.promisify(func, opts)
  }

  /**
   * Promisifies the entire object by going through the object's properties and creating an async equivalent of each function on the object and its prototype chain.
   * @param  {[Object]} target [needed to promisify Object]
   * @param  {[Object{suffix: String='Async', mutiArgs: boolean=false, filter: boolean function (String name, Object target, function func, boolean passesDefaultFilter), promisifier: function (function originalFunction, function defaultPromisifier)}]} opts [The promisified method name will be the original method name suffixed with suffix (default is "Async").Note that the original methods on the object are not overwritten but new methods are created with the Async-suffix. ]
   * @return {Class | Instance}      [Promisified Class or Instance]
   */
  function promisifyAll (target, opts) {
    return Promise.promisifyAll(target, opts)
  }

  fastify.decorate('utils', {
    promisify,
    promisifyAll
  })

  next()
}

module.exports = fp(declareUtils, require('./config').fv)