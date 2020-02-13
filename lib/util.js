'use strict'

const debug = require('./debug')

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

module.exports = {
  ReqiError,
  header
}
