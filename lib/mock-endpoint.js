'use strict'

const http = require('http')

const hostname = 'localhost'
const port = 3000

class MockEndpoint {
    constructor() {
        this.server = http.createServer((req, res) => {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')

            if (req.url === '/get') {
                let payload = {
                    statusCode: 200,
                    headers: {
                        ContentType: 'application/json'
                    },
                    data: ''
                }
                if (req.on('data', (chunk) => {
                    data += chunk
                }))
                res.write(JSON.stringify(payload))
                res.end()
            }
        }).listen(port, hostname)

        console.log('Listening on port 3000...')
    }
}

const mock = new MockEndpoint()

module.exports = MockEndpoint