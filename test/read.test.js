module.exports = test

/* global describe, it */

var Subservice = require('..')
  , assert = require('assert')
  , uid = require('hat')
  , addressSchema = require('./fixtures/address-schema')()

function test(service) {

  describe('read()', function () {

    it('should callback with the address object for a particular id', function (done) {
      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
      service.create({}, function (err, savedObject) {
        if (err) return done(err)
        addressService.create(savedObject._id, require('./fixtures/address-valid-new')(), function (err, savedAddress) {
          if (err) return done(err)
          assert(savedAddress)
          addressService.read(savedObject._id, savedAddress._id, function (err, obj) {
            if (err) return done(err)
            assert(obj)
            done()
          })
        })
      })
    })

    it('should not error if an address does not exist for the given id', function (done) {

      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
      service.create({}, function (err, savedObject) {
        if (err) return done(err)
        addressService.read(savedObject._id, uid(), function (err, obj) {
          assert(!err)
          assert(!obj)
          done()
        })
      })
    })

    it('should error if no entity exists for the given id', function (done) {

      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
      addressService.read(uid(), uid(), function (err) {
        assert(err)
        assert(err instanceof Error)
        done()
      })

    })

  })

}