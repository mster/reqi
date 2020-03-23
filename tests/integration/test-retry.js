'use strict'
const tape = require('tape')
const ReqiClient = require('../../lib/client')
const http = require('http')
let server
const WAIT = 1 * 1000 // wait 1000 ms

tape('setup server retry-after: 1 second', function (t) {
  server = http.createServer()
  const time = new Date()
  server.on('request', (req, res) => {
    let elapsed
    if (elapsed >= WAIT) {
      res.writeHead(200)
      res.end()
    } else {
      res.writeHead(429, { 'retry-after': 1 })
      res.end()
      elapsed = (new Date() - time)
      console.log('elapsed after send 429 code:', elapsed, 'ms')
    }
  })
  server.listen(0, function () {
    server.url = 'http://localhost:' + this.address().port
    t.end()
  })
})

tape('retry with retry-after set to 1 second', function (t) {
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
