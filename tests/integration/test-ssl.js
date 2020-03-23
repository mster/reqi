'use strict'
const tape = require('tape')
const ReqiClient = require('../../lib/client')
const ssl = require('../ssl/server')
const fs = require('fs')
const path = require('path')
let server

tape('setup', function (t) {
  server = ssl.createSSLServer()
  server.on('request', (req, res) => {
    res.writeHead(200)
    req.pipe(res)
  })
  server.listen(0, 'localhost', () => {
    server.url = 'https://localhost:' + server.address().port
    t.end()
  })
})

tape('test https request', function (t) {
  const basePath = path.join(__dirname, '..', 'ssl')
  const client = new ReqiClient()
  const requestOptions = {
    url: server.url,
    key: fs.readFileSync(path.join(basePath, 'client.key')),
    cert: fs.readFileSync(path.join(basePath, '..', 'ssl', 'client.crt')),
    ca: fs.readFileSync(path.join(basePath, '..', 'ssl', 'ca.crt'))
  }
  client.request(requestOptions).then((response) => {
    t.equal(200, response.statusCode)
    t.end()
  }).catch((error) => {
    t.fail(error)
    t.end()
  })
})

tape('cleanup', function (t) {
  server.close(t.end)
})
