'use strict'
const tape = require('tape')
const ReqiClient = require('../../lib/client')
const http = require('http')
let server
const WAIT = 1

tape('setup', function (t) {
  server = http.createServer()
  let time = new Date()
  server.on('request', (req, res) => {
    const elapsed = new Date() - time
    if (elapsed >= WAIT) {
      res.writeHead(200)
      res.end()
      time = new Date()
    } else {
      res.writeHead(429, { 'retry-after': 1 })
      res.end()
    }
  })
  server.listen(0, function () {
    server.url = 'http://localhost:' + this.address().port
    t.end()
  })
})

tape('retry', function (t) {
  const client = new ReqiClient({ retry: 1, retryCodes: 429 })
  client.get(server.url).then((response) => {
    t.equal(response.statusCode, 200)
    t.end()
  }).catch((error) => {
    t.fail(error)
    t.end()
  })
})

tape('cleanup', function (t) {
  server.close(t.end)
})
