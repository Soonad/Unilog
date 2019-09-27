const app = require('fastify')({ logger: true })

app.register(require('./routes/api-routes'))

module.exports = app.listen(3000, function (err, addr) {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  app.log.info(`server listening on ${addr}`)
})
