'use strict'
const fs = require( 'fs' )
const rc = require( 'rc' )

module.exports = rc( 'console', {
  server: {
    host: 'localhost',
    port: 3000,
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
  psp: {
    app_key: 'Your_app_key',
    app_secret: 'Your_very_secure_secret',
    host: 'http://private-7cbf7-psprest.apiary-mock.com',
    key: fs.readFileSync( './keys/client-key.pem' ),
    cert: fs.readFileSync( './keys/client-cert.pem' ),
    ca: [ './keys/server-cert.pem' ],
    requestCert: true,
    rejectUnauthorized: true
  },
  jwt: {
    secret: './keys/server-key.pem',
    options: {
      expiresIn: 3600
    }
  }

} )