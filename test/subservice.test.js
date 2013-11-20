var createService = require('./fixtures/dummy-service')
  , Subservice = require('..')
  , assert = require('assert')
  , service = createService()

/* global describe, it */

describe('crud-subservice', function () {

  describe('new Subservice()', function () {

    it('should be a function', function () {
      assert.equal(typeof Subservice, 'function')
    })

    it('should take a service, and return an object that has CRUD methods for address management', function () {
      var addressService = new Subservice('deliveryAddresses', service)
    ; [ 'create', 'read', 'update', 'delete' ].forEach(function (key) {
        assert(typeof addressService[key], 'function')
      })
    })

  })


  describe('attached to crud-service', function () {
    require('./create.test')(service)
    require('./read.test')(service)
    require('./update.test')(service)
    require('./delete.test')(service)
  })

  describe('attached to subservice', function () {
    require('./create-nested.test')(service)
    require('./read-nested.test')(service)
    require('./update-nested.test')(service)
    require('./delete-nested.test')(service)
  })

})