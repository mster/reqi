'use strict'

const tape = require('tape')
const ReqiClient = require('../../lib/client')
const http = require('http')
let server
let serverRedirect

tape('setup redirect server', function(t) {
    serverRedirect = http.createServer()
    serverRedirect.on('request', (req, res) => {
        res.writeHead(200)
        res.end()
    })
    serverRedirect.listen(0, function() {
        serverRedirect.url = 'http://localhost:' + this.address().port
        t.end()
    })
})

tape('setup server', function(t) {
    server = http.createServer()
    server.on('request', (req, res) => {
        res.writeHead(301, {'location': serverRedirect.url})
        res.end()
    })
    server.listen(0, function () {
        server.url = 'http://localhost:' + this.address().port
        t.end()
    })
})

tape('test redirect', function(t) {
    const client = new ReqiClient({redirect: true, redirectCodes: 301})
    client.request(serverRedirect.url).then((response) => {
        t.equals(response.statusCode, 200)
        t.end()
    }).catch((error) => {
        t.fail(error)
        t.end()
    })
})

tape('cleanup', function(t) {
    server.close()
    serverRedirect.close(t.end)
})