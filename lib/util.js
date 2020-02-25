'use strict'

const debug = require('./debug')
const https = require('https')
const http = require('http')

class ReqiError extends Error {
  constructor (message, options) {
    super(message)
    this.name = this.constructor.name
    this.message = message
    this.options = Object.assign({}, options)
    Error.captureStackTrace(this, this.constructor)
  }
}

function header (headers, field) {
  if (!headers || !headers[field]) {
    debug(`'${field}' field or headers not found.`)
    return null
  }

  if (headers[field] === +headers[field]) {
    return Number(headers[field])
  }

  return headers[field]
}

function getProtocol (optionsURI) {
  try {
    const myURL = new URL(optionsURI)
    const protocol = myURL.protocol.includes('https:') ? https : http
    return protocol
  } catch (error) { return null }
}

module.exports = {
  ReqiError,
  header,
  getProtocol
}
