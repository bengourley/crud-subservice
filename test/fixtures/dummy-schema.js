module.exports = createSchema

var schemata = require('schemata')

function createSchema() {
  return schemata(
    { _id: { type: String }
    , deliveryAddresses: { type: Array }
    })
}