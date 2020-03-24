'use strict'

const ReqiClient = require('../../lib/client')
const ReqiError = require('../../lib/error')
const tape = require('tape')
const http = require('http')
let server

tape('setup', function (t) {
  server = http.createServer()
  server.on('request', (req, res) => {
    res.writeHead(200)
    res.end()
  })
  server.listen(0, function () {
    server.url = 'http://localhost:' + this.address().port
    t.end()
  })
})

tape('agent should be set by Reqi if agent is undefined.', function (t) {
  const client = new ReqiClient()
  const requestOptions = { agent: undefined, url: server.url }

  client.request(requestOptions).then((response) => {
    const actual = response.requestOptions.agent.constructor.name
    const expected = 'Agent'

    t.equals(actual, expected)
    t.end()
  }).catch((error) => {
    t.fail(error)
    t.end()
  })
})

tape('agent should be set by Reqi if agent is not supplied.', function (t) {
  const client = new ReqiClient()
  const requestOptions = { url: server.url }

  client.request(requestOptions).then((response) => {
    const actual = response.requestOptions.agent.constructor.name
    const expected = 'Agent'

    t.equals(actual, expected)
    t.end()
  }).catch((error) => {
    t.fail(error)
    t.end()
  })
})

tape('agent should not be set by Reqi if agent is false.', function (t) {
  const client = new ReqiClient()
  const requestOptions = { agent: false, url: server.url }

  client.request(requestOptions).then((response) => {
    const actual = response.requestOptions.agent
    const expected = false

    t.equals(actual, expected)
    t.end()
  }).catch((error) => {
    t.fail(error)
    t.end()
  })
})

tape('request should return error on invalid agent.', function (t) {
  const client = new ReqiClient()
  const requestOptions = { agent: 'string-agent', url: server.url }

  client.request(requestOptions).then((response) => {
    t.fail(response)
    t.end()
  }).catch((error) => {
    const actual = error
    const expected = new ReqiError('The "options.agent" property must be one of type Agent-like Object, undefined, or false.')

    t.deepEquals(actual, expected)
    t.end()
  })
})

tape('cleanup', function (t) {
  server.close()
  t.end()
})
