'use strict'

const tape = require('tape')
const ReqiClient = require('../../lib/client')

tape('creating Reqi Client should create a reqiOptions object containing defaults', function (t) {
  const client = new ReqiClient()
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

tape('creating Reqi Client with initOptions should create a reqiOptions object containing modified defaults', function (t) {
  const initOptions = {
    redirect: true,
    retry: 1,
    retryCodes: [426]
  }
  const client = new ReqiClient(initOptions)
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
