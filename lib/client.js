'use strict'

const https = require('https')
const http = require('http')

class ClientRequest {
    constructor() {
        
    }

    async get(opts) {
        return new Promise((resolve, reject) => {
            let options = Object.assign(
                { 
                    redirect: false,
                    redirectCount: 0,
                    retryCodes: [] 
                }, 
                opts
            )

            const protocol = options.url.includes('https://') ? https : http
            protocol.get(options.url, (res) => {

                // error handling (retry)
                const { statusCode } = res

                const contentType = res.headers['content-type']
        
                // 200
                res.setEncoding('utf8')
                let payload = {
                    code: statusCode,
                    data: '',
                }
                res.on('data', chunk => payload.data += chunk)
                res.on('end', () => {
                    /* follow redirect */ 
                    if (statusCode == 301 && options.redirect && options.redirectCount > 0) {
                        options.redirectCount--
                        console.log('redirect')
                        return resolve(this.get(options))
                    }

                    return resolve(payload)
                })

            }).on('error', err => {
                return reject(new Error(err))
            })
        })
    }
}

module.exports = ClientRequest
