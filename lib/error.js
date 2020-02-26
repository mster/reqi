'use strict'

class ReqiError extends Error {
  constructor (message, options) {
    super(message)
    this.name = this.constructor.name
    this.message = message
    this.error = true
    this.options = Object.assign({}, options)
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = ReqiError
