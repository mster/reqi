'use strict'

const test = require('tape')
const ReqiError = require('../../lib/error')
const ReqiRequest = require('../../lib/client')

test('creating ReqiRequest should create a reqiOptions object containing defaults', function(t) {
    let client = new ReqiRequest()
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

test('creating ReqiRequest with initOptions should create a reqiOptions object containing modified defaults', function(t) {
    const initOptions = {
        redirect: true
    }
    let client = new ReqiRequest(initOptions)
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

