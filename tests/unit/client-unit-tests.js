'use strict'

const test = require('tape')
const ReqiRequest = require('../../lib/client')

test('creating ReqiRequest should create a reqiOptions object containing defaults', function (t) {
  const client = new ReqiRequest()
  const actual = client.clientOptions
  const expected = {
    redirect: false,
    retry: false,
    retryCodes: [],
    maxWait: 3,
    json: false
  }
  t.deepEqual(actual, expected)
  t.end()
})

test('creating ReqiRequest with initOptions should create a reqiOptions object containing modified defaults', function (t) {
  const initOptions = {
    redirect: true,
    retry: 1,
    retryCodes: [426]
  }
  const client = new ReqiRequest(initOptions)
  const actual = client.clientOptions
  const expected = {
    redirect: true,
    retry: 1,
    retryCodes: [426],
    maxWait: 3,
    json: false
  }
  t.deepEqual(actual, expected)
  t.end()
})
