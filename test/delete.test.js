module.exports = test

/* global describe, it */

var Subservice = require('..')
  , assert = require('assert')
  , uid = require('hat')
  , addressSchema = require('./fixtures/address-schema')()

function test(service) {

  describe('delete()', function () {

    it('should remove an address by the given id', function (done) {

      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
      service.create({}, function (err, savedObject) {
        if (err) return done(err)
        addressService.create(savedObject._id, require('./fixtures/valid-new')(), function (err, savedAddress) {
          if (err) return done(err)
          assert(savedAddress)
          service.read(savedObject._id, function (err, savedObject) {
            if (err) return done(err)
            assert.equal(Object.keys(savedObject.deliveryAddresses).length, 1)
            addressService.delete(savedObject._id, savedAddress._id, function (err) {
              if (err) return done(err)
              service.read(savedObject._id, function (err, savedObject) {
                if (err) return done(err)
                assert.equal(Object.keys(savedObject.deliveryAddresses).length, 0)
                done()
              })
            })
          })
        })
      })

    })

    it('should delete the correct item from a list of existing addresses', function (done) {

      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
        , existing = { deliveryAddresses: [] }

      // Create some existing addresses
      for (var i = 0; i < 3; i++) {
        var o = require('./fixtures/valid-new')()
        o._id = uid()
        existing.deliveryAddresses.push(o)
      }

      var key = existing.deliveryAddresses[1]._id

      // Update a property to be sure that the correct address is deleted
      existing.deliveryAddresses[1].fullName = 'Mrs. G Unit'

      // Save the entity with the existing addresses
      service.create(existing, function (err, savedObject) {
        if (err) return done(err)

        assert.equal(savedObject.deliveryAddresses.length, 3)
        addressService.delete(savedObject._id, key, function (err, obj) {
          if (err) return done(err)
          // Make sure that the object removed is the one we wanted
          assert.equal(obj.fullName, 'Mrs. G Unit')
          // Ensure it actually got removed from the object
          service.read(savedObject._id, function (err, obj) {
            assert.equal(obj.deliveryAddresses.length, 2)
            done()
          })
        })
      })

    })

    it('should error if an address does not exist for the given id', function (done) {
      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
      service.create({}, function (err, savedObject) {
        if (err) return done(err)
        addressService.delete(savedObject._id, uid(), function (err) {
          assert(err)
          assert(err instanceof Error)
          done()
        })
      })
    })

    it('should error if no entity exists for the given id', function (done) {

      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
      addressService.delete(uid(), uid(), function (err) {
        assert(err)
        assert(err instanceof Error)
        done()
      })

    })

  })

}