'use strict'

const test = require('tape')
const ReqiError = require('../../lib/error')
const ReqiClient = require('../../lib/client')
const http = require('http')
let server


test('setup', function(t) {
    server = http.createServer()
    server.on('request', (req, res) => {
        res.writeHead(200)
        req.pipe(res)
    })
    server.listen(3000, 'localhost')
    console.log('Listening on port 3000...')
    t.end()
})

test('A request should return success status code', function(t) {
    const client = new ReqiClient()
    const request = client.request('http://localhost:3000').then((response) => {
        t.equal(200, response.statusCode)
    }).catch((error) => {
        t.fail(error)
    })
    t.end()
})

test('An invalid request should return ReqiError', function(t) {
    const client = new ReqiClient()
    const request = client.request('http://localhost:9999').then((response) => {
        t.fail(response)
    }).catch((error) => {
        t.equal('ReqiError', error.name)
    })
    t.end()
})


test('cleanup', function (t) {
    server.close(t.end)
})