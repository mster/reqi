'use strict'

const debug = require('./debug')
const ReqiError = require('./error')

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
  if (!requestOptions || !requestOptions.url) {
    return new ReqiError('Error: options.url is required.', requestOptions)
  }

  if (addons && typeof addons === 'object' && addons.constructor === Object) {
    requestOptions = Object.assign(requestOptions, addons)
  }

  let url
  try {
    url = new URL(requestOptions.url)
  } catch (error) {
    return new ReqiError('Error: invalid url.')
  }

  const options = Object.assign(
    {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      protocol: url.protocol
    },
    requestOptions
  )

  return options
}

module.exports = {
  header,
  generateOptions
}
