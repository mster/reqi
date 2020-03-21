'use strict'
const https = require('https')
const fs = require('fs')
const path = require('path')

exports.createSSLServer = function () {
  const options = {
    key: fs.readFileSync(path.join(__dirname, 'server.key')),
    cert: fs.readFileSync(path.join(__dirname, 'server.crt')),
    ca: fs.readFileSync(path.join(__dirname, 'ca.crt')),
    requestCert: true
  }
  return https.createServer(options)
}
