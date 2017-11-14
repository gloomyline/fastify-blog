/*
* @Author: AlanWang
* @Date:   2017-11-14 11:58:26
* @Last Modified by:   AlanWang
* @Last Modified time: 2017-11-14 14:08:42
*/

const fp = require('fastify-plugin')

module.exports = fp(function (fastify, opts, next) {
  const db = fastify.mongo.db
  const jwt = fastify.jwt

  async function verifyJWTandMongo (request, reply, done) {
    const token = request.req.headers['authorization']
    if (!token) {
      done(new Error('Missing token header!'))
    }

    // decode by jwt
    let decoded = await jwt.verify(token)
    // fetch corresponding user from user collection
    let data
    try {
      data = await db.collection('users').findOne({ user: decoded.user }, { fields: { pwd: 1 } }) 
    } catch (err) {
      if (err.notFound) {
        return done(new Error('Token invalid, does not have the user'))
      }
      return done(err)
    }
    // check pwd is valid or not
    if (!data.pwd || data.pwd !== decoded.pwd) {
      return done(new Error('Token invalid, password is not correct'))
    }
    request.log.info('User authorized')
    done()
  }

  async function verifyUserAndPwd (request, reply, done) {
    // fetch corresponding user from user collection
    let data
    try {
      data = db.collection('users').findOne({ user: request.body.user })
    } catch (err) {
      if (err.notFound) {
        return done(new Error('User does not exsit'))
      }
      return done(err)
    }
    // check pwd is valid or not
    if (!data.pwd || data.pwd !== request.body.pwd) {
      return done(new Error('Password is not correct'))
    }
    request.log.info('Pwd id valid')
    done()
  }

  fastify.decorate('verify', {
    jwt: verifyJWTandMongo,
    uap: verifyUserAndPwd
  })

  next ()
}, require('./config').fv)