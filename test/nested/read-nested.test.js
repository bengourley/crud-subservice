module.exports = test

/* global describe, it */

var Subservice = require('..')
  , assert = require('assert')
  , uid = require('hat')
  , addressSchema = require('./fixtures/address-schema')()
  , phoneNumberSchema = require('./fixtures/phone-number-schema')()

function test(service) {

  describe('read()', function () {

    it('should callback with the phone number object for a particular id', function (done) {

      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
        , phoneNumberService = new Subservice('phoneNumbers', addressService, phoneNumberSchema)

      service.create({}, function (err, savedObject) {
        if (err) return done(err)
        addressService.create(savedObject._id, require('./fixtures/address-valid-new')(), function (err, savedAddress) {
          if (err) return done(err)
          assert(savedAddress)
          var ids = [ savedObject._id, savedAddress._id ]
          phoneNumberService.create(ids, require('./fixtures/phone-number-valid-new')(), function (err, savedPhoneNumber) {
            if (err) return done(err)
            assert(savedPhoneNumber)
            phoneNumberService.read([ savedObject._id, savedAddress._id ], savedPhoneNumber._id, function (err, phoneNumber) {
              if (err) return done(err)
              var fixture = require('./fixtures/phone-number-valid-new')()
              fixture._id = phoneNumber._id
              assert.deepEqual(phoneNumber, fixture)
              done()
            })
          })
        })
      })

    })

    it('should not error if a phone number does not exist for the given id', function (done) {

      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
        , phoneNumberService = new Subservice('phoneNumbers', addressService, phoneNumberSchema)

      service.create({}, function (err, savedObject) {
        if (err) return done(err)
        addressService.create(savedObject._id, require('./fixtures/address-valid-new')(), function (err, savedAddress) {
          if (err) return done(err)
          assert(savedAddress)
          var ids = [ savedObject._id, savedAddress._id ]
          phoneNumberService.create(ids, require('./fixtures/phone-number-valid-new')(), function (err, savedPhoneNumber) {
            if (err) return done(err)
            assert(savedPhoneNumber)
            phoneNumberService.read([ savedObject._id, savedAddress._id ], uid(), function (err, phoneNumber) {
              assert(!err)
              assert(!phoneNumber)
              done()
            })
          })
        })
      })
    })

    it('should error if no entity exists for the given id', function (done) {

      var addressService = new Subservice('deliveryAddresses', service, addressSchema)
        , phoneNumberService = new Subservice('phoneNumbers', addressService, phoneNumberSchema)
      phoneNumberService.read([ uid(), uid() ], uid(), function (err) {
        assert(err)
        assert(err instanceof Error)
        done()
      })

    })

  })

}