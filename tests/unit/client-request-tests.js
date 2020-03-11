'use strict'

var test = require('tape')
const ReqiError = require('../../lib/error')
var ClientRequest = require('../../lib/client')

test('creating ClientRequest should create a reqiOptions object containing defaults', function(t) {
    let client = new ClientRequest()
    const actual = client.reqiOptions
    const expected = {
      redirect: false,
      redirectCount: 0,
      retryCodes: [408, 429, 503],
      retryCount: 3,
      maxWait: 15,
      parseJSON: false
    }
    t.deepEqual(actual, expected)
    t.end()
})

test('creating ClientRequest with initOptions should create a reqiOptions object containing modified defaults', function(t) {
    const initOptions = {
        redirect: true
    }
    let client = new ClientRequest(initOptions)
    const actual = client.reqiOptions
    const expected = {
      redirect: true,
      redirectCount: 0,
      retryCodes: [408, 429, 503],
      retryCount: 3,
      maxWait: 15,
      parseJSON: false
    }
    t.deepEqual(actual, expected)
    t.end()
})

