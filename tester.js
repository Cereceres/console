'use strict'
const faker = require( 'faker' )
const Coevent = require( 'co-eventemitter' )
const Kamaji = require( 'kamaji-sdk-js' )
const config = require( './config' )
const fs = require( 'fs' )
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
  customer, Customers = [ ],
  order, Orders = [ ],
  product, Products = [ ],
  card, Cards = [ ],
  payment, Payments = [ ],
  i, j, items, num, unitPrice,
  newproduct

coevent.on( 'create', function* ( number ) {
  yield kamaji.connect( )
  for ( i = 0; i < number.customer; i++ ) {

    customer = new kamaji.Customer( {
      firstname: faker.name.firstName( ),
      lastname: faker.name.lastName( ),
      email: faker.internet.email( )
    } )
    customer = yield customer.save( {
      lean: true
    } )
    Customers.push( customer )
  }
  for ( i = 0; i < number.card; i++ ) {
    customer = Customers[ Math.floor( Math.random( ) * number.customer ) ]
    card = new kamaji.Card( {
      email: 'email to test',
      customer: customer._id,
      holderFirstname: customer.firstname,
      holderLastname: customer.lastname,
      cardNumber: '4242424242424242',
      expirationYear: '2018',
      expirationMonth: '08',
      cvv: '456',
      conektaToken: '6345wgyj7i37675246y2tq46u82'
    } )
    card = yield card.save( {
      lean: true
    } )
    Cards.push( card )
  }
  for ( i = 0; i < number.product; i++ ) {
    unitPrice = Math.floor( 1000 * Math.random( ) )
    newproduct = {
      store: 'store1',
      title: faker.lorem.words( 2 )
        .join( ' ' ),
      referenceCode: '2345234534534543',
      skuId: 'sku2',
      shortDescription: faker.lorem.words( 6 )
        .join( ' ' ),
      description: faker.lorem.words( 6 )
        .join( ' ' ),
      characteristics: faker.lorem.words( 6 )
        .join( ' ' ),
      unitPrice: unitPrice,
      unitPriceDiscount: unitPrice * ( 1 - 0.3 * Math.random( ) ),
      stock: 234,
      active: Math.random( ) < 0.5,
      discount: Math.random( ) < 0.5,
      type: 'type',
      edit: Math.random( ) < 0.5
    }
    product = new kamaji.Product( newproduct )
    product = yield product.save( {
      lean: true
    } )
    Products.push( product )
  }
  for ( i = 0; i < number.order; i++ ) {
    items = [ ]
    num = Math.floor( 0.1 * Math.random( ) * number.product + 1 )
    num = num < 5 ? 5 : num
    for ( j = 0; j < num; j++ ) {
      product = Products[ Math.floor( Math.random( ) * number.product ) ]
      items.push( {
        item: product._id,
        quantity: faker.random.number( 10 ) + 1,
        discount: 0.6 * Math.random( ) * product.unitPrice
      } )
    }
    order = new kamaji.Order( {
      subject: faker.lorem.words( 3 )
        .join( ' ' ),
      description: 'description',
      customer: customer._id,
      order: Math.floor( Math.random( ) * 10000000000 ),
      items: items
    } )
    order = yield order.save( {
      lean: true
    } )
    Orders.push( order )
  }
} )
coevent.on( 'pay', function* ( ) {
  card = Cards[ Math.floor( Math.random( ) * Cards.length ) ]
  order = Orders[ Math.floor( Math.random( ) * Orders.length ) ]
  payment = new kamaji.Payment( {
    subject: faker.lorem.words( 3 )
      .join( ' ' ),
    paymentMethod: 'Credit card',
    card: card._id,
    order: order._id
  } )
  payment = yield payment.save( {
    lean: true
  } )
  console.log( 'fraudProbability =' + payment.fraudProbability + '\n',
    'isFraud =' + payment.isFraud + '\n',
    'status =' + payment.status + '\n',
    'paid =' + payment.paid + '\n' )
  Payments.push( payment )

} )

coevent.emit( 'create', {
    customer: 35,
    product: 200,
    card: 40,
    order: 20
  } )
  .then( function ( ) {
    console.log( 'all faker data are created' );
    setInterval( function ( ) {
      coevent.emit( 'pay' )
    }, 2500 )
  } )
  .catch( function ( e ) {
    console.log( 'errror happen', e );
  } )

process.on( 'uncaughtException', ( err ) => {
  console.log( `Caught exception: ${err}` );
} );