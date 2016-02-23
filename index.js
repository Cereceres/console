#!/usr/bin/env node

'use strict'
require( 'colors' )
const Kamaji = require( 'kamaji-sdk-js' )
const faker = require( 'faker' )
const config = require( '../config' )
const fs = require( 'fs' )
const Coevent = require( 'co-eventemitter' )
  // Kamji connection
  //
global.fixtures.connection = {
  host: process.env.HOST || 'https://' + config.server.host + ':' + config.server
    .port,
  key: process.env.KEY || './keys/client-key.pem',
  cert: process.env.CERT || './keys/client-cert.pem',
  ca: process.env.CA || './keys/server-cert.pem'
}

// Store for test, the stores are created from CMS
//
global.fixtures.store = {
  appKey: faker.random.number( 9999999 ) || process.env.APPKEY,
  appSecret: faker.random.uuid( ) || process.env.APPSECRET,
}

let kamaji = new Kamaji( {
  appKey: global.fixtures.store.appKey,
  appSecret: global.fixtures.store.appSecret,
  host: global.fixtures.connection.host,
  key: fs.readFileSync( './keys/unauthorized-client-key.pem' ),
  cert: fs.readFileSync( './keys/unauthorized-client-cert.pem' ),
  ca: fs.readFileSync( './keys/server-cert.pem' )
} )

let coevent = new Coevent( )
coevent( 'pay', function* ( mount ) {
  yield kamaji.connect( )
  let payment = new kamaji.payment( )

} )


const program = require( 'commander' )
program
  .command( 'pay <order>' )
  .alias( 'p' )
  .description( 'execute the given remote cmd' )
  .action( function ( order ) {
    console.log( 'pay %s ', order );
  } )

program.parse( process.argv );