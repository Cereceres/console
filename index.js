#!/usr/bin/env node

'use strict'
const Kamaji = require( 'kamaji-sdk-js' )
const config = require( './config' )
const fs = require( 'fs' )
const Coevent = require( 'co-eventemitter' )
const inquirer = require( 'inquirer' );
let res
  // Kamji connection
  //
global.fixtures = {}
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
  appKey: 'testtoconsole',
  appSecret: 'secretAccessKey'
}

let kamaji = new Kamaji( {
  appKey: global.fixtures.store.appKey,
  appSecret: global.fixtures.store.appSecret,
  host: global.fixtures.connection.host,
  key: fs.readFileSync( './keys/unauthorized-client-key.pem' ),
  cert: fs.readFileSync( './keys/unauthorized-client-cert.pem' ),
  ca: fs.readFileSync( './keys/server-cert.pem' )
} )
let coevent = new Coevent( ),
  card
coevent.on( 'card', function* ( data ) {
    console.log( 'generando la card' );
    card = new kamaji.Card( data )
    card = yield card.save( )
    console.log( 'respose card:', card );
  } )
  .on( 'pay', function* ( answers ) {
    res = yield kamaji.connect( )
    if ( !answers.haveCard ) {
      yield coevent.emit( 'card', {
        holderFirstname: answers.firstname,
        holderLastname: answers.lastname,
        cardNumber: answers.number,
        cvv: answers.cvv,
        expirationMonth: answers.expiry_month,
        expirationYear: answers.expiry_year,
        customer: answers.customer,
      } )
    } else {
      card = answers.card
    }

    let payment = new kamaji.Payment( {
      order: answers.reference_id,
      card: card
    } )
    res = yield payment.save( {
      lean: true
    } )
    console.log( 'respose Payment:', res );
  } )
  .on( 'error', function ( e ) {
    console.log( 'error in the event=', e );
  } )
const program = require( 'commander' )
program
  .command( 'pay' )
  .alias( 'p' )
  .description( 'execute the given' )
  .action( function ( ) {
    inquirer.prompt(
      [ {
        type: 'confirm',
        name: 'haveOrder',
        message: 'Have a order?',
        default: true
      }, {
        type: 'input',
        name: 'reference_id',
        message: 'reference_id?',
        when: function ( ans ) {
          return ans.haveOrder
        }
      }, {
        type: 'confirm',
        name: 'haveCard',
        message: 'Have a card?',
        default: true
      }, {
        type: 'input',
        name: 'card',
        message: 'reference_id of Card?',
        when: function ( ans ) {
          return ans.haveCard
        }
      }, {
        type: 'confirm',
        name: 'createCard',
        message: 'Do want create a Card?',
        when: function ( ans ) {
          return !ans.haveCard
        },
        default: true
      }, {
        type: 'input',
        name: 'firstname',
        message: 'Owner firstname Card?',
        when: function ( ans ) {
          return !ans.haveCard && ans.createCard
        }
      }, {
        type: 'input',
        name: 'lastname',
        message: 'Owner lastname Card?',
        when: function ( ans ) {
          return !ans.haveCard && ans.createCard
        }
      }, {
        type: 'input',
        name: 'number',
        message: 'Number Card?',
        when: function ( ans ) {
          return !ans.haveCard && ans.createCard
        }
      }, {
        type: 'input',
        name: 'cvv',
        message: 'cvv Card?',
        when: function ( ans ) {
          return !ans.haveCard && ans.createCard
        }
      }, {
        type: 'input',
        name: 'expiry_month',
        message: 'expiry month Card?',
        when: function ( ans ) {
          return !ans.haveCard && ans.createCard
        }
      }, {
        type: 'input',
        name: 'expiry_year',
        message: 'expiry  year Card?',
        when: function ( ans ) {
          return !ans.haveCard && ans.createCard
        }
      }, {
        type: 'input',
        name: 'customer',
        message: 'customer owner card?',
        when: function ( ans ) {
          return !ans.haveCard && ans.createCard
        }
      } ],
      function ( answers ) {
        coevent.emit( 'pay', answers )
          .catch( function ( e ) {
            console.log( 'error=', e.stack );
          } )
      } )
  } )

program.parse( process.argv );