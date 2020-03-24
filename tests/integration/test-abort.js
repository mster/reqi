'use strict'

const tape = require('tape')
const ReqiClient = require('../../lib/client')
const ReqiError = require('../../lib/error')
const http = require('http')
let server

tape('setup', function (t) {
  server = http.createServer()
  server.on('request', (req, res) => {
    // abort all requests
    req.connection.end()
  })
  server.listen(0, function () {
    server.url = 'http://localhost:' + this.address().port
    t.end()
  })
})

tape('request should reject with error on an \'abort\' event.', async function (t) {
  const client = new ReqiClient()
  const clientOptions = { url: server.url }

  let res
  try {
    res = await client.request(clientOptions)
  } catch (error) {
    res = error
  }

  const actual = res
  const expected = new ReqiError('Error: socket hang up')

  t.deepEqual(actual, expected)
  t.end()
})

tape('cleanup', function (t) {
  server.close(t.end)
})
