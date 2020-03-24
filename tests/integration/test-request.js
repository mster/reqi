'use strict'

const ReqiClient = require('../../lib/client')
const tape = require('tape')
const http = require('http')
let server

const client = new ReqiClient()

tape('setup server', function(t) {
    server = http.createServer()
    server.on('request', (req, res) => {
        res.writeHead(200)
        res.end()
    })
    server.listen(0, function() {
        server.url = 'http://localhost:' + this.address().port
        t.end()
    })
})

tape('test request', async function(t) {
    let response
    try{
        response = await client.request(server.url)
        t.equals(response.statusCode, 200)
        t.end()
    }catch(error) {
        t.fail(error)
        t.end()
    }
})

tape('test get request', async function(t) {
    let response
    try{
        response = await client.get(server.url)
        t.equals(response.statusCode, 200)
        t.end()
    }catch(error) {
        t.fail(error)
        t.end()
    }
})

tape('test head request', async function(t) {
    let response
    try{
        response = await client.head(server.url)
        t.equals(response.statusCode, 200)
        t.end()
    }catch(error) {
        t.fail(error)
        t.end()
    }
})

tape('test delete request', async function(t) {
    let response
    try{
        response = await client.delete(server.url)
        t.equals(response.statusCode, 200)
        t.end()
    }catch(error) {
        t.fail(error)
        t.end()
    }
})

tape('test post request', async function(t) {
    let response
    try{
        response = await client.post(server.url)
        t.equals(response.statusCode, 200)
        t.end()
    }catch(error) {
        t.fail(error)
        t.end()
    }
})

tape('test put request', async function(t) {
    let response
    try{
        response = await client.put(server.url)
        t.equals(response.statusCode, 200)
        t.end()
    }catch(error) {
        t.fail(error)
        t.end()
    }
})

tape('test patch request', async function(t) {
    let response
    try{
        response = await client.patch(server.url)
        t.equals(response.statusCode, 200)
        t.end()
    }catch(error) {
        t.fail(error)
        t.end()
    }
})

tape('cleanup', function(t) {
    server.close(t.end)
})