module.exports = test

/* global describe, it */

var Subservice = require('../..')
  , assert = require('assert')
  , uid = require('hat')
  , addressSchema = require('../fixtures/address-schema')()
  , phoneNumberSchema = require('../fixtures/phone-number-schema')()

function test(service) {

  describe('delete()', function () {

    it('should remove a phone number by the given id', function (done) {

      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
        , phoneNumberService = new Subservice('phoneNumbers', addressService, phoneNumberSchema)
        , address = require('../fixtures/address-valid-new')()
        , existing = { deliveryAddresses: [] }
        , number = require('../fixtures/phone-number-valid-new')()

      address._id = uid()
      existing.deliveryAddresses.push(address)
      number._id = uid()
      existing.deliveryAddresses[0].phoneNumbers.push(number)

      service.create(existing, function (err, savedObject) {
        if (err) return done(err)
        phoneNumberService.delete([ savedObject._id, address._id ], number._id, function (err) {
          if (err) return done(err)
          service.read(savedObject._id, function (err, savedObject) {
            if (err) return done(err)
            assert.equal(savedObject.deliveryAddresses[0].phoneNumbers.length, 0)
            done()
          })
        })
      })

    })

    it('should delete the correct item from a list of existing phone numbers', function (done) {

      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
        , phoneNumberService = new Subservice('phoneNumbers', addressService, phoneNumberSchema)
        , address = require('../fixtures/address-valid-new')()
        , existing = { deliveryAddresses: [] }

      address._id = uid()
      existing.deliveryAddresses.push(address)

      // Create some existing addresses
      for (var i = 0; i < 3; i++) {
        var o = require('../fixtures/phone-number-valid-new')()
        o._id = uid()
        existing.deliveryAddresses[0].phoneNumbers.push(o)
      }

      var key = existing.deliveryAddresses[0].phoneNumbers[1]._id

      // Update a property to be sure that the correct address is deleted
      existing.deliveryAddresses[0].phoneNumbers[1].label = 'work'

      // Save the entity with the existing addresses
      service.create(existing, function (err, savedObject) {
        if (err) return done(err)

        assert.equal(savedObject.deliveryAddresses[0].phoneNumbers.length, 3)
        var ids = [ savedObject._id, existing.deliveryAddresses[0]._id ]
        phoneNumberService.delete(ids, key, function (err, obj) {
          if (err) return done(err)
          // Make sure that the object removed is the one we wanted
          assert.equal(obj.label, 'work')
          // Ensure it actually got removed from the object
          service.read(savedObject._id, function (err, obj) {
            assert.equal(obj.deliveryAddresses[0].phoneNumbers.length, 2)
            done()
          })
        })
      })

    })

    it('should error if a phone number does not exist for the given id', function (done) {

      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
        , phoneNumberService = new Subservice('phoneNumbers', addressService, phoneNumberSchema)
        , address = require('../fixtures/address-valid-new')()
        , existing = { deliveryAddresses: [] }

      address._id = uid()
      existing.deliveryAddresses.push(address)

      service.create(existing, function (err, savedObject) {
        if (err) return done(err)
        phoneNumberService.delete([ savedObject._id, address._id ], uid(), function (err) {
          assert(err)
          assert(err instanceof Error)
          done()
        })
      })

    })

    it('should error if no entity exists for the given id', function (done) {

      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
        , phoneNumberService = new Subservice('phoneNumbers', addressService, phoneNumberSchema)

      phoneNumberService.delete([ uid(), uid() ], uid(), function (err) {
        assert(err)
        assert(err instanceof Error)
        done()
      })

    })

  })

}