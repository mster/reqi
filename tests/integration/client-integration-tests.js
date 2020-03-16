'use strict'

const test = require('tape')
const ReqiError = require('../../lib/error')
const MockEndpoint = require('../../lib/mock-endpoint')
const ReqiClient = require('../../lib/client')


test('sending a GET request should return proper response', function(t) {
    const initOptions = {
        redirect: false,
        redirectCount: 0,
        retryCodes: [408, 429, 503],
        retryCount: 3,
        maxWait: 15, // seconds
        parseJSON: false
    }

    const mock = new MockEndpoint()
    const client = new ReqiClient(initOptions)

    const requestOptions = {
        url: 'http://localhost/3000/get'
    }

    const response = client.get(requestOptions)
    console.log('response ' + response)
    t.deepEqual(response, requestOptions)
    t.end()
})