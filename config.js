'use strict'
const fs = require( 'fs' )
const rc = require( 'rc' )

module.exports = rc( 'console', {
  server: {
    host: 'localhost',
    port: 8000,
    key: './keys/server-key.pem',
    cert: './keys/server-cert.pem',
    ca: [ './keys/client-cert.pem' ]
  },
  database: {
    mongo: 'mongodb://localhost:27017/core'
  },
  mongo: {
    url: 'mongodb://localhost:27017/core'
  },
  aws: {
    access_key_id: 'ID_AWS',
    secret_access_key: 'super_secret',
    sqs_url: 'http://sqs_url:500'
  },
  jwt: {
    secret: './keys/server-key.pem',
    options: {
      expiresIn: 3600
    }
  }

} )