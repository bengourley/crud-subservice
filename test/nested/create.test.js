module.exports = test

/* global describe, it */

var Subservice = require('../..')
  , assert = require('assert')
  , uid = require('hat')
  , addressSchema = require('../fixtures/address-schema')()
  , phoneNumberSchema = require('../fixtures/phone-number-schema')()

function test(service) {

  describe('create()', function () {

    it('should add a valid phone number to the subservice entity at the desired property', function (done) {

      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
        , phoneNumberService = new Subservice('phoneNumbers', addressService, phoneNumberSchema)

      service.create({}, function (err, savedObject) {
        if (err) return done(err)
        addressService.create(savedObject._id, require('../fixtures/address-valid-new')(), function (err, savedAddress) {
          if (err) return done(err)
          assert(savedAddress)
          var ids = [ savedObject._id, savedAddress._id ]
          phoneNumberService.create(ids, require('../fixtures/phone-number-valid-new')(), function (err, savedPhoneNumber) {
            if (err) return done(err)
            assert(savedPhoneNumber)
            service.read(savedObject._id, function (err, obj) {
              if (err) return done(err)
              assert.equal(obj.deliveryAddresses.length, 1)
              assert.equal(obj.deliveryAddresses[0].phoneNumbers.length, 1)
              done()
            })
          })
        })
      })

    })

    it('should error if no entity exists for the given id', function (done) {

      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
        , phoneNumberService = new Subservice('phoneNumbers', addressService, phoneNumberSchema)
      phoneNumberService.create([ 'abc', '123' ], require('../fixtures/address-valid-new')(), function (err) {
        assert(err)
        assert(err instanceof Error)
        done()
      })

    })

    it('should add to a list of existing phone numbers', function (done) {

      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
        , phoneNumberService = new Subservice('phoneNumbers', addressService, phoneNumberSchema)
        , existing = { deliveryAddresses: [ require('../fixtures/address-valid-new')() ] }

      for (var i = 0; i < 3; i++) existing.deliveryAddresses[0].phoneNumbers.push(require('../fixtures/phone-number-valid-new')())

      service.create(existing, function (err, savedObject) {
        if (err) return done(err)
        var ids = [ savedObject._id, existing.deliveryAddresses[0]._id ]
        phoneNumberService.create(ids, require('../fixtures/phone-number-valid-new')(), function (err, savedPhoneNumber) {
          if (err) return done(err)
          assert(savedPhoneNumber)
          service.read(savedObject._id, function (err, obj) {
            if (err) return done(err)
            assert.equal(obj.deliveryAddresses[0].phoneNumbers.length, 4)
            done()
          })
        })
      })

    })

    it('should replace an existing phone number with a matching id', function (done) {

      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
        , phoneNumberService = new Subservice('phoneNumbers', addressService, phoneNumberSchema)
        , address = require('../fixtures/address-valid-new')()
        , existing = { deliveryAddresses: [] }

      address._id = uid()
      existing.deliveryAddresses.push(address)

      // Create some existing numbers
      for (var i = 0; i < 3; i++) {
        var o = require('../fixtures/phone-number-valid-new')()
        o._id = uid()
        existing.deliveryAddresses[0].phoneNumbers.push(o)
      }

      // Save the entity with the existing addresses
      service.create(existing, function (err, savedObject) {
        if (err) return done(err)
        var number = require('../fixtures/phone-number-valid-new')()

        // Give the number to save one of the existing id/keys
        number._id = savedObject.deliveryAddresses[0].phoneNumbers[2]._id
        // Update a property to be sure that the existing number is replaced
        number.label = 'work'

        var ids = [ savedObject._id, savedObject.deliveryAddresses[0]._id ]
        phoneNumberService.create(ids, number, function (err, savedPhoneNumber) {
          if (err) return done(err)
          assert(savedPhoneNumber)
          service.read(savedObject._id, function (err, obj) {
            if (err) return done(err)
            // Make sure that the number of addresses did not change
            assert.equal(obj.deliveryAddresses[0].phoneNumbers.length, 3)
            // Make sure the changed property was updated
            assert.equal(obj.deliveryAddresses[0].phoneNumbers[2].label, number.label)
            done()
          })
        })
      })

    })

    it('should not add a phone number if it is invalid', function (done) {

      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
        , phoneNumberService = new Subservice('phoneNumbers', addressService, phoneNumberSchema)
        , address = require('../fixtures/address-valid-new')()
        , existing = { deliveryAddresses: [] }

      address._id = uid()
      existing.deliveryAddresses.push(address)

      service.create(existing, function (err, savedObject) {
        if (err) return done(err)
        var ids = [ savedObject._id, address._id ]
        phoneNumberService.create(ids, require('../fixtures/invalid-missing')(), function (err) {
          assert(err)
          assert(err instanceof Error)
          assert(Object.keys(err.errors).length > 1)
          service.read(savedObject._id, function (err, obj) {
            if (err) return done(err)
            assert.equal(Object.keys(obj.deliveryAddresses[0].phoneNumbers).length, 0)
            done()
          })
        })
      })

    })

    it('should call back with the saved phone number', function (done) {

      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
        , phoneNumberService = new Subservice('phoneNumbers', addressService, phoneNumberSchema)
        , address = require('../fixtures/address-valid-new')()
        , existing = { deliveryAddresses: [] }

      address._id = uid()
      existing.deliveryAddresses.push(address)

      service.create(existing, function (err, savedObject) {
        if (err) return done(err)
        var ids = [ savedObject._id, address._id ]
        phoneNumberService.create(ids, require('../fixtures/phone-number-valid-new')(), function (err, phoneNumber) {
          assert(!err)
          assert(phoneNumber)
          var fixture = require('../fixtures/phone-number-valid-new')()
          fixture._id = phoneNumber._id
          assert.deepEqual(fixture, phoneNumber)
          done()
        })
      })

    })

  })

}