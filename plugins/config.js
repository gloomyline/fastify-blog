/*
* @Author: AlanWang
* @Date:   2017-10-30 13:12:40
* @Last Modified by:   AlanWang
* @Last Modified time: 2017-10-30 13:18:46
*/

'use strict'

module.exports= {
  fv: `>=${require('../package.json').dependencies.fastify.replace(/\^/g, '')}`
}