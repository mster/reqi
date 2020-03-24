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

tape('agent should be set by Reqi if agent is undefined.', async function (t) {
  const client = new ReqiClient()
  const requestOptions = { agent: undefined, url: server.url }

  let res
  try {
    res = await client.request(requestOptions)
  } catch (error) {
    res = error
  }

  const actual = (res && res.requestOptions && res.requestOptions.agent) ? res.requestOptions.agent.constructor.name : res
  const expected = 'Agent'

  t.equals(actual, expected)
  t.end()
})

tape('agent should be set by Reqi if agent is not supplied.', async function (t) {
  const client = new ReqiClient()
  const requestOptions = { url: server.url }

  let res
  try {
    res = await client.request(requestOptions)
  } catch (error) {
    res = error
  }

  const actual = (res && res.requestOptions && res.requestOptions.agent) ? res.requestOptions.agent.constructor.name : res
  const expected = 'Agent'

  t.equals(actual, expected)
  t.end()
})

tape('agent should not be set by Reqi if agent is false.', async function (t) {
  const client = new ReqiClient()
  const requestOptions = { agent: false, url: server.url }

  let res
  try {
    res = await client.request(requestOptions)
  } catch (error) {
    res = error
  }

  const actual = (res && res.requestOptions) ? res.requestOptions.agent : res
  const expected = false

  t.equals(actual, expected)
  t.end()
})

tape('request should return error on invalid agent.', async function (t) {
  const client = new ReqiClient()
  const requestOptions = { agent: 'string-agent', url: server.url }

  let res
  try {
    res = await client.request(requestOptions)
  } catch (error) {
    res = error
  }

  const actual = res
  const expected = new ReqiError('The "options.agent" property must be one of type Agent-like Object, undefined, or false.')

  t.deepEqual(actual, expected)
  t.end()
})

tape('cleanup', function (t) {
  server.close()
  t.end()
})
