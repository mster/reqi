'use strict'

const debug = require('./debug')
const ReqiError = require('./error')
const { URL } = require('url')

function header (headers, field) {
  if (!headers || !headers[field]) {
    debug(`'${field}' field or headers not found.`)
    return null
  }

  if (headers[field] == +headers[field]) { // eslint-disable-line eqeqeq
    return Number(headers[field])
  }

  return headers[field]
}

function generateOptions (requestOptions, addons) {
  if (requestOptions && typeof requestOptions === 'string') {
    requestOptions = { url: requestOptions }
  }

  if (!requestOptions || !requestOptions.url) {
    return { ...requestOptions, error: new ReqiError('Error: options.url is required.', requestOptions) }
  }

  if (addons && typeof addons === 'object' && addons.constructor === Object) {
    requestOptions = { ...requestOptions, ...addons }
  }

  let url
  try {
    url = new URL(requestOptions.url)
  } catch (error) {
    return { ...requestOptions, error: new ReqiError('Error: invalid URL (options.url).', requestOptions) }
  }

  const options = {
    ...requestOptions,
    origin: url.origin,
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    protocol: url.protocol
  }

  return options
}

module.exports = {
  header,
  generateOptions
}
