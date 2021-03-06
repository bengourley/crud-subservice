module.exports = Subservice

var uid = require('hat')

function Subservice(name, service, schema, options) {

  this.name = name
  this.options = options || {}
  this.options.idProperty = this.options.idProperty || '_id'

  this.service = service
  this.schema = schema

}

/*
 * Create a single subservice entity
 */
Subservice.prototype.create = function (entityId, obj, options, cb) {

  // This function doesn't have any options, but having options as an argument matches
  // the signature of crud-service create/update, making nested services simpler
  if (typeof options === 'function') cb = options

  if (!Array.isArray(entityId)) entityId = [ entityId ]

  this.service.read.apply(this.service, entityId.concat(function (err, entity) {

    if (err) return cb(err)
    if (!entity) return cb(new Error('No entity found with id ' + entityId))

    // Fill in defaults from schema and coerce properties into the correct type
    obj = this.schema.cast(this.schema.makeDefault(obj))

    // Run validation
    this.schema.validate(obj, function (err, validationErrors) {

      if (err) return cb(err)

      // Callback with any validation errors
      if (Object.keys(validationErrors).length > 0) {
        var validationError = new Error('Validation Error')
        validationError.errors = validationErrors
        return cb(validationError, obj)
      }

      // Otherwise carry on and add the obj

      if (obj[this.options.idProperty]) {

        // Incoming obj has an id
        var index = getIndex.call(this, obj[this.options.idProperty], entity[this.name])
        if (typeof index === 'undefined') {
          // Create
          entity[this.name].push(obj)
        } else {
          // Update
          entity[this.name][index] = obj
        }

      } else {

        // Incoming obj doesn't have an id
        var id = uid()
        obj[this.options.idProperty] = id
        entity[this.name].push(obj)

      }

      entityId.pop()

      // Update the service entity with the new obj
      var updateFn = this.service.update
        , updateObj = entity

      if (this.service.partialUpdate) {
        updateFn = this.service.partialUpdate
        updateObj = {}
        updateObj[this.options.idProperty] = entity[this.options.idProperty]
        updateObj[this.name] = entity[this.name]
      }

      updateFn.apply(this.service, entityId.concat([ updateObj, {}, function (err, updated) {
        if (err) return cb(err)
        var saved = extractFromArray.call(this, obj[this.options.idProperty], updated[this.name])
        cb(null, saved)
      }.bind(this) ]))

    }.bind(this))

  }.bind(this)))

}

/*
 * Get the item with the given id for the given service entity
 */
Subservice.prototype.read = function (entityId, objId, cb) {

  if (!Array.isArray(entityId)) entityId = [ entityId ]

  this.service.read.apply(this.service, entityId.concat(function (err, entity) {
    if (err) return cb(err)
    if (!entity) return cb(new Error('No entity found with id ' + entityId))
    cb(null, extractFromArray.call(this, objId, entity[this.name]))
  }.bind(this)))

}

/*
 * Remove item with the given id for the given service entity
 */
Subservice.prototype.delete = function (entityId, objId, cb) {

  if (!Array.isArray(entityId)) entityId = [ entityId ]

  this.service.read.apply(this.service, entityId.concat(function (err, entity) {

    if (err) return cb(err)
    if (!entity) return cb(new Error('No entity found with id ' + entityId))

    var deleteIndex = getIndex.call(this, objId, entity[this.name])

    // The address with this id doesn't exist
    if (typeof deleteIndex === 'undefined') return cb(new Error('No entity found with id ' + objId))

    // Keep track of what was removed so it can be used in the callback
    var deleted = entity[this.name][deleteIndex]

    entity[this.name].splice(deleteIndex, 1)

    entityId.pop()

    // Update the service entity with the new obj
    var updateFn = this.service.update
      , updateObj = entity

    if (this.service.partialUpdate) {
      updateFn = this.service.partialUpdate
      updateObj = {}
      updateObj[this.options.idProperty] = entity[this.options.idProperty]
      updateObj[this.name] = entity[this.name]
    }

    // Update the service entity with the removed item
    updateFn.apply(this.service, entityId.concat([ updateObj, {}, function (err, updated) {
      if (err) return cb(err)
      cb(null, deleted)
    }.bind(this) ]))

  }.bind(this)))

}

// `update()` is just an alias for `create()`, as at least for now, they have
// near identical functional requirements. update() does upsert – i.e if the
// item does not yet exist it creates it, and create() does an existence check
// and updates if the object already exists. They have seperate tests incase the
// functionality needs to diverge in the future.
Subservice.prototype.update = Subservice.prototype.create

function extractFromArray(id, array) {
  return array.filter(function (o) {
    return o[this.options.idProperty] === id
  }.bind(this))[0]
}

function getIndex(id, array) {
  for (var i = 0; i < array.length; i++) {
    if (array[i][this.options.idProperty] === id) return i
  }
}
