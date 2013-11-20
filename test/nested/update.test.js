module.exports = test

/* global describe, it */

var Subservice = require('../..')
  , assert = require('assert')
  , uid = require('hat')
  , addressSchema = require('../fixtures/address-schema')()
  , phoneNumberSchema = require('../fixtures/phone-number-schema')()

function test(service) {

  describe('update()', function () {

    it('should update an phone number with the given id', function (done) {

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
        phoneNumberService.update(ids, number, function (err, savedPhoneNumber) {
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

    it('should create a phone number if it doesn\'t yet exist', function (done) {

      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
        , phoneNumberService = new Subservice('phoneNumbers', addressService, phoneNumberSchema)

      service.create({}, function (err, savedObject) {
        if (err) return done(err)
        addressService.create(savedObject._id, require('../fixtures/address-valid-new')(), function (err, savedAddress) {
          if (err) return done(err)
          assert(savedAddress)
          var ids = [ savedObject._id, savedAddress._id ]
          phoneNumberService.update(ids, require('../fixtures/phone-number-valid-new')(), function (err, savedPhoneNumber) {
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

    it('should error if the provided phone number is invalid', function (done) {

      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
        , phoneNumberService = new Subservice('phoneNumbers', addressService, phoneNumberSchema)
        , address = require('../fixtures/address-valid-new')()
        , existing = { deliveryAddresses: [] }

      address._id = uid()
      existing.deliveryAddresses.push(address)

      service.create(existing, function (err, savedObject) {
        if (err) return done(err)
        var ids = [ savedObject._id, address._id ]
        phoneNumberService.update(ids, require('../fixtures/invalid-missing')(), function (err) {
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

    it('should error if no entity exists for the given id', function (done) {

      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
        , phoneNumberService = new Subservice('phoneNumbers', addressService, phoneNumberSchema)
      phoneNumberService.update([ 'abc', '123' ], require('../fixtures/address-valid-new')(), function (err) {
        assert(err)
        assert(err instanceof Error)
        done()
      })

    })

  })

}