'use strict'
const faker = require('faker')
const Coevent = require('co-eventemitter')
const Psp = require('psp-sdk-js')
const config = require('./config')
const fs = require('fs')
let n = 0,
  frauds = 0
  // Kamji connection
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

let psp = new Psp({
  email: global.fixtures.store.email,
  password: global.fixtures.store.password,
  host: global.fixtures.connection.host,
  key: fs.readFileSync('./keys/unauthorized-client-key.pem'),
  cert: fs.readFileSync('./keys/unauthorized-client-cert.pem'),
  ca: fs.readFileSync('./keys/server-cert.pem')
})
let coevent = new Coevent(),
  customer, Customers = [],
  card, Cards = {},
  payment, Payments = [],
  i, j, ncards

coevent.on('create', function*(number) {
  yield psp.connect()
  console.log('creando:', number.customer);
  for (i = 0; i < number.customer; i++) {
    customer = {
      firstname: faker.name.firstName(),
      lastname: faker.name.lastName(),
      email: faker.internet.email()
    }
    Customers.push(customer)
  }

  for (j = 0; j < number.customer; j++) {
    customer = Customers[j]
    Cards[customer] = []
    ncards = Math.floor(Math.random() * number.card + 1)
    for (i = 0; i < ncards; i++) {
      card = new psp.Card({
        firstname: customer.firstname,
        lastname: customer.lastname,
        card: '4242424242424242',
        expiry_year: (Math.floor(Math.random() * 30) + 2016)
          .toString(),
        expiry_month: '08',
        cvv: Math.floor(Math.random() * 10)
          .toString() + Math.floor(Math.random() * 10)
          .toString() + Math.floor(Math.random() * 10)
          .toString()
      })
      card = yield card.save({
        lean: true
      })
      console.log('card saved=', card);
      Cards[customer].push(card)
    }
  }
})
coevent.on('pay', function*() {
  n++
  customer = Customers[Math.floor(Math.random() * Customers.length)]
  card = Cards[customer][Math.floor(Math.random() * Cards[customer].length)]
  payment = new psp.Payment({
    amount: Math.floor(Math.random() * 4997) + 3,
    token: card.token,
    firstname: customer.firstname,
    lastname: customer.lastname,
    email: customer.email,
    items: [{
      item: 'totest'
    }],
    referenceId: (Math.floor(Math.random() * 100000000000000000000))
      .toString()
  })
  payment = yield payment.save({
    lean: true
  })
  if (payment.isFraud) {
    frauds++
  }
  console.log(
    'fraudProbability =' + payment.fraudProbability +
    '\n',
    'amount:' + parseFloat(payment.amount) + '\n',
    'isFraud =' + payment.isFraud + '\n',
    'status =' + payment.status + '\n')
  console.log('=====================\n');
  console.log('% Frauds = ' + Math.floor(frauds / n * 100) + '\n');
  console.log('=====================\n');

  Payments.push(payment)
})
coevent.emit('create', {
    customer: 10000,
    card: 20
  })
  .then(function() {
    console.log('all faker data are created');
    setInterval(function() {
      coevent.emit('pay')
    }, 100)
  })
  .catch(function(e) {
    console.log('errror happen', e);
  })

process.on('uncaughtException', (err) => {
  console.log(`Caught exception: ${err}`);
});
