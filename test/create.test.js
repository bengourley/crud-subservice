module.exports = test

/* global describe, it */

var Subservice = require('..')
  , assert = require('assert')
  , uid = require('hat')
  , addressSchema = require('./fixtures/address-schema')()

function test(service) {

  describe('create()', function () {

    it('should add a valid address to the service entity at the desired property', function (done) {

      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
      service.create({}, function (err, savedObject) {
        if (err) return done(err)
        addressService.create(savedObject._id, require('./fixtures/valid-new')(), function (err, savedAddress) {
          if (err) return done(err)
          assert(savedAddress)
          service.read(savedObject._id, function (err, obj) {
            if (err) return done(err)
            assert.equal(Object.keys(obj.deliveryAddresses).length, 1)
            done()
          })
        })
      })

    })

    it('should error if no entity exists for the given id', function (done) {

      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
      addressService.create('123', require('./fixtures/valid-new')(), function (err) {
        assert(err)
        assert(err instanceof Error)
        done()
      })

    })

    it('should add to a list of existing addresses', function (done) {

      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
        , existing = { deliveryAddresses: {} }

      for (var i = 0; i < 3; i++) existing.deliveryAddresses[uid()] = require('./fixtures/valid-new')()

      service.create(existing, function (err, savedObject) {
        if (err) return done(err)
        addressService.create(savedObject._id, require('./fixtures/valid-new')(), function (err, savedAddress) {
          if (err) return done(err)
          assert(savedAddress)
          service.read(savedObject._id, function (err, obj) {
            if (err) return done(err)
            assert.equal(Object.keys(obj.deliveryAddresses).length, 4)
            done()
          })
        })
      })

    })

    it('should replace an existing address with a matching id', function (done) {

      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
        , existing = { deliveryAddresses: {} }

      // Create some existing addresses
      for (var i = 0; i < 3; i++) existing.deliveryAddresses[uid()] = require('./fixtures/valid-new')()

      // Save the entity with the existing addresses
      service.create(existing, function (err, savedObject) {
        if (err) return done(err)
        var address = require('./fixtures/valid-new')()
          , key = Object.keys(savedObject.deliveryAddresses)[2]

        // Give the address to save one of the existing id/keys
        address._id = key
        // Update a property to be sure that the existing address is replaced
        address.fullName = 'Mrs. G Unit'

        addressService.create(savedObject._id, address, function (err, savedAddress) {
          if (err) return done(err)
          assert(savedAddress)
          service.read(savedObject._id, function (err, obj) {
            if (err) return done(err)
            // Make sure that the number of addresses did not change
            assert.equal(Object.keys(obj.deliveryAddresses).length, 3)
            // Make sure the changed property was updated
            assert.equal(obj.deliveryAddresses[key].fullName, address.fullName)
            done()
          })
        })
      })

    })

    it('should not add an address if it is invalid', function (done) {

      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
      service.create({}, function (err, savedObject) {
        if (err) return done(err)
        addressService.create(savedObject._id, require('./fixtures/invalid-missing')(), function (err) {
          assert(err)
          assert(err instanceof Error)
          assert(Object.keys(err.errors).length > 1)
          service.read(savedObject._id, function (err, obj) {
            if (err) return done(err)
            assert.equal(Object.keys(obj.deliveryAddresses).length, 0)
            done()
          })
        })
      })

    })

    it('should call back with the saved address', function (done) {
      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
        , address = require('./fixtures/valid-new')()
      service.create({}, function (err, savedObject) {
        if (err) return done(err)
        addressService.create(savedObject._id, address, function (err, savedAddress) {
          if (err) return done(err)
          assert(savedAddress._id)
          Object.keys(address).forEach(function (key) {
            assert.notEqual(typeof savedAddress[key], 'undefined')
          })
          done()
        })
      })
    })

  })

}