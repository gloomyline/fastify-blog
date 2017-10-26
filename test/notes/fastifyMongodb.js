/*
* @Author: AlanWang
* @Date:   2017-10-26 17:37:12
* @Last Modified by:   AlanWang
* @Last Modified time: 2017-10-26 18:05:42
*/

const fastify = require('fastify')()

fastify.register(require('fastify-mongodb'), {
  url: 'mongodb://localhost:27017/blog-system'
}, err => {
  if (err) throw err
})

fastify.get('/user/:id', (req, rep) => {
  const { db } = fastify.mongo
  db.collection('users', onCollection)
  function onCollection (err, col) {
    if (err) return rep.send(err)

    console.log('11', col)

    col.findOne({ id: Number(req.params.id) }, (err, user) => {
      if (err) return rep.send(err)
      console.log('22', user)
      rep.send(user)
    }) 
  }
})

fastify.listen(3000, err => {
  if (err) throw err
  console.log(`server listening on ${fastify.server.address().port}`)
})