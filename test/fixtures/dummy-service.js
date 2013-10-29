module.exports = createService

var crudService = require('crud-service')
  , save = require('save')

function createService() {

  var collection = save('dummy', { debug: false })
    , schema = require('./dummy-schema')()
    , service = crudService('dummy', collection, schema, {})

  return service

}