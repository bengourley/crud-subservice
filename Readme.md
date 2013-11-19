# crud-subservice

[![Build Status](https://travis-ci.org/bengourley/validity-number-in-range.png?branch=master)](https://travis-ci.org/bengourley/validity-number-in-range)

[![NPM](https://nodei.co/npm/crud-subservice.png)](https://nodei.co/npm/crud-subservice/)

Nest crud-services within [crud-services](http://npm.im/crud-service). Useful if you have any sort of rich
nested item within your service entities that you want to store within the same object, eg:

- delivery addresses for a customer
- downloads on an article
- available sizes of an item of clothing

## Installation

    npm install crud-subservice

## Usage

```js
var CrudService = require('crud-service')
  , Subservice = require('crud-subservice')
  , save = require('save')
  , customerSchema = require('./customer-schema')
  , addressSchema = require('./address-schema')
  , customerService = new CrudService('customer', save('customer'), customerSchema())
  , addressService = new Subservice('addresses', customerService, addressSchema())

// addressService now has the methods create(), update(), read() and delete()
// and stores its items on customerService entities at the .addresses property.
```

## API

### var sub = new Subservice(String: propertyName, CrudService: service, Schemata: schema)

Create a new subservice that stores entites on the parent `service` entities on the property
`propertyName`. A `schemata` schema is required for validation.

### subservice.create(String: entityId, Object: obj, Function: cb)

Create a subservice entity `obj` on the parent entity with id = `entityId`. Callback
has the signature `function (err, savedObj) {}`.

### subservice.read(String: entityId, String: objId, Function: cb)

Read a subservice entity with id = `objId` on the parent entity with
id = `entityId`. Callback has the signature `function (err, obj) {}`.

### subservice.update(String: entityId, Object: obj, Function: cb)

Update a subservice entity with new properties `obj` on the parent entity with
id = `entityId`. Callback has the signature `function (err, updateObj) {}`.

### subservice.delete(String: entityId, String: objId, Function: cb)

Delete a subservice entity with id = `objId` on the parent entity with
id = `entityId`. Callback has the signature `function (err, deletedObj) {}`.

## Licence
Licensed under the [New BSD License](http://opensource.org/licenses/bsd-license.php)