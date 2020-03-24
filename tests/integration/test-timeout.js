'use strict'

const tape = require('tape')
const ReqiClient = require('../../lib/client')
const ReqiError = require('../../lib/error')
const http = require('http')
let server

tape('setup', function (t) {
  server = http.createServer()
  server.on('request', (req, res) => {
    res.writeHead(200)
    req.pipe(res)
  })
  server.listen(0, function () {
    server.url = 'http://localhost:' + this.address().port
    t.end()
  })
})

tape('setting timeout option effects socket timeout', async function (t) {
  const client = new ReqiClient()
  const clientOptions = { timeout: 1, url: server.url }

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
