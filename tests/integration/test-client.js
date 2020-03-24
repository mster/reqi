'use strict'

const tape = require('tape')
const ReqiClient = require('../../lib/client')
const http = require('http')
let server

tape('setup', function (t) {
  server = http.createServer()
  server.on('request', (req, res) => {
    res.writeHead(200)
    req.pipe(res)
  })
  server.listen(0, () => {
    server.url = 'http://localhost:' + server.address().port
    t.end()
  })
})

tape('A request should return success status code', function (t) {
  const client = new ReqiClient()
  const requestOptions = { url: server.url, method: 'GET' }
  client.request(requestOptions).then((response) => {
    t.equal(200, response.statusCode)
    t.end()
  }).catch((error) => {
    t.fail(error)
    t.end()
  })
})

tape('An invalid request should return ReqiError', function (t) {
  const client = new ReqiClient()
  const requestOptions = { url: 'http://localhost:9999', method: 'GET' }
  client.request(requestOptions).then((response) => {
    t.fail(response)
    t.end()
  }).catch((error) => {
    t.equal('ReqiError', error.name)
    t.end()
  })
})

tape('changing client options should change request behavior.', async function (t) {
  const client = new ReqiClient()
  const requestOptions = { url: server.url }

  let firstRes
  try {
    firstRes = await client.request(requestOptions)
  } catch (error) {
    firstRes = error
  }

  client.clientOptions.retryCodes = 200
  client.clientOptions.retry = 3

  let secondRes
  try {
    secondRes = await client.request(requestOptions)
  } catch (error) {
    secondRes = error
  }

  const firstRetry = (firstRes.requestOptions && firstRes.requestOptions.reqCount) ? firstRes.requestOptions.reqCount.retry : null
  const secondRetry = (secondRes.requestOptions && secondRes.requestOptions.reqCount) ? secondRes.requestOptions.reqCount.retry : null

  const actual = [firstRetry, secondRetry]
  const expected = [0, 3]

  t.deepEquals(actual, expected)
  t.end()
})

tape('cleanup', function (t) {
  server.close(t.end)
})
