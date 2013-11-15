module.exports = test

/* global describe, it */

var Subservice = require('..')
  , assert = require('assert')
  , uid = require('hat')
  , addressSchema = require('./fixtures/address-schema')()

function test(service) {

  describe('update()', function () {

    it('should update an address with the given id', function (done) {

      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
        , existing = { deliveryAddresses: [] }

      // Create some existing addresses
      for (var i = 0; i < 3; i++) {
        var o = require('./fixtures/valid-new')()
        o._id = uid()
        existing.deliveryAddresses.push(o)
      }

      // Save the entity with the existing addresses
      service.create(existing, function (err, savedObject) {
        if (err) return done(err)
        var address = require('./fixtures/valid-new')()
          , key = savedObject.deliveryAddresses[2]._id

        // Give the address to save one of the existing id/keys
        address._id = key
        // Update a property to be sure that the existing address is replaced
        address.fullName = 'Mrs. G Unit'

        addressService.update(savedObject._id, address, function (err, savedAddress) {
          if (err) return done(err)
          assert(savedAddress)
          service.read(savedObject._id, function (err, obj) {
            if (err) return done(err)
            // Make sure that the number of addresses did not change
            assert.equal(obj.deliveryAddresses.length, 3)
            // Make sure the changed property was updated
            assert.equal(obj.deliveryAddresses[2].fullName, address.fullName)
            done()
          })
        })
      })

    })

    it('should create an address if it doesn\'t yet exist', function (done) {

      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
        , existing = { deliveryAddresses: [] }

      // Create some existing addresses
      for (var i = 0; i < 3; i++) {
        var o = require('./fixtures/valid-new')()
        o._id = uid()
        existing.deliveryAddresses.push(o)
      }

      service.create(existing, function (err, savedObject) {
        if (err) return done(err)
        addressService.update(savedObject._id, require('./fixtures/valid-new')(), function (err, savedAddress) {
          if (err) return done(err)
          assert(savedAddress)
          service.read(savedObject._id, function (err, obj) {
            if (err) return done(err)
            assert.equal(obj.deliveryAddresses.length, 4)
            done()
          })
        })
      })
    })

    it('should error if the provided address is invalid', function (done) {
      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
      service.create({}, function (err, savedObject) {
        if (err) return done(err)
        addressService.create(savedObject._id, require('./fixtures/valid-new')(), function (err, savedAddress) {
          if (err) return done(err)
          var update = require('./fixtures/invalid-missing')()
          // Grab the id of the saved valid item with which to update
          update._id = savedAddress._id
          addressService.update(savedObject._id, update, function (err) {
            assert(err)
            assert(err instanceof Error)
            assert(Object.keys(err.errors).length > 1)
            done()
          })
        })
      })
    })

    it('should error if no entity exists for the given id', function (done) {

      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
      addressService.update(uid(), {}, function (err) {
        assert(err)
        assert(err instanceof Error)
        done()
      })

    })

  })

}