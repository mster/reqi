'use strict'

const ReqiClient = require('../../lib/client')
const ReqiError = require('../../lib/error')
const tape = require('tape')
const http = require('http')
let server

tape('setup', function(t) {
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

tape('request gives input error when supplied with invalid input of client opts', function(t) {
    const client = new ReqiClient({retry: new ReqiClient() })
    client.request(server.url).then((response) => {
        t.fail(response)
        t.end()
    }).catch((error) => {
        t.deepEquals(error, new ReqiError('Error: client options contain invalid input'))
        t.end()
    })
})

tape('cleanup', function(t) {
    server.close(t.end)
})