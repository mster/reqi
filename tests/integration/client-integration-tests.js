'use strict'

const tape = require('tape')
const ReqiClient = require('../../lib/client')
const http = require('http')
let server


tape('setup', function(t) {
    server = http.createServer()
    server.on('request', (req, res) => {
        res.writeHead(200)
        req.pipe(res)
    })
    server.listen(3000, 'localhost', () => {
        console.log('Listening on port 3000...')
        t.end()
    })
})

tape('A request should return success status code', function(t) {
    const client = new ReqiClient()
    const requestOptions = {url: 'http://localhost:3000', method: 'GET'}
    const request = client.request(requestOptions).then((response) => {
        t.equal(200, response.statusCode)
    }).catch((error) => {
        t.fail(error)
    })
    t.end()
})

tape('An invalid request should return ReqiError', function(t) {
    const client = new ReqiClient()
    const requestOptions = {url: 'http://localhost:9999', method: 'GET'}
    const request = client.request(requestOptions).then((response) => {
        t.fail(response)
    }).catch((error) => {
        t.equal('ReqiError', error.name)
    })
    t.end()
})


tape('cleanup', function (t) {
    server.close(t.end)
})