#!/usr/bin/env node

'use strict'
const Psp = require( 'psp-sdk-js' )
const config = require( './config' )
const fs = require( 'fs' )
const Coevent = require( 'co-eventemitter' )
const inquirer = require( 'inquirer' );
// Kamji connection
//
global.fixtures = {}
global.fixtures.connection = {

  host: process.env.HOST || 'http://' + config.server.host + ':' + config.server
    .port,
  key: process.env.KEY || './keys/client-key.pem',
  cert: process.env.CERT || './keys/client-cert.pem',
  ca: process.env.CA || './keys/server-cert.pem'
}

// Store for test, the stores are created from CMS
//
global.fixtures.store = {
  appKey: 'testtoconsole',
  appSecret: 'secretAccessKey',
  email: 'kamaji@email.com',
  password: '4356345765765'

}

let psp = new Psp( {
  email: global.fixtures.store.email,
  password: global.fixtures.store.password,
  host: global.fixtures.connection.host,
  key: fs.readFileSync( './keys/unauthorized-client-key.pem' ),
  cert: fs.readFileSync( './keys/unauthorized-client-cert.pem' ),
  ca: fs.readFileSync( './keys/server-cert.pem' )
} )
let coevent = new Coevent( ),
  card
coevent.on( 'card', function* ( data ) {
    console.log( 'generando la card' );
    card = new psp.Card( data )
    card = yield card.save( {
      lean: true
    } )
    console.log( 'respose card:', card );
    card = card.token
    return card
  } )
  .on( 'pay', function* ( answers ) {
    console.log( 'conectando el PSP' );
    let res = yield psp.connect( )
    console.log( 'res', res );
    if ( !answers.haveCard ) {
      res = yield this.emit( 'card', {
        firstname: answers.firstname,
        lastname: answers.lastname,
        card: answers.number,
        cvv: answers.cvv,
        expiry_month: answers.expiry_month,
        expiry_year: answers.expiry_year
      } )
      console.log( 'res of card', res );
      card = card.token
    } else {
      card = answers.card
    }
    console.log( 'generando el pago' );
    let payment = new psp.Payment( {
      amount: answers.amount || Math.floor( Math.random( ) * 5000 ),
      token: card,
      firstname: answers.firstname,
      lastname: answers.lastname,
      email: answers.email,
      items: [ {
        item: 'totest'
      } ],
      referenceId: ( Math.floor( Math.random( ) * 100000000000000000000 ) )
        .toString( )
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
        name: 'haveCard',
        message: 'Have a card?',
        default: true
      }, {
        type: 'input',
        name: 'card',
        message: 'token of Card?',
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
      }, {
        type: 'input',
        name: 'email',
        message: 'email to contact?',
      }, {
        type: 'input',
        name: 'amount',
        message: 'monto a cobrar?'
      } ],
      function ( answers ) {
        coevent.emit( 'pay', answers )
          .catch( function ( e ) {
            console.log( 'error=', e.stack );
          } )
      } )
  } )

program.parse( process.argv );