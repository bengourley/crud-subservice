module.exports = createSchema

var schemata = require('schemata')
  , validity = require('validity')

function createSchema() {

  return schemata(
    { _id: { type: String }
    , label:
      { type: String
      , validators: { all: [validity.required] }
      }
    , number:
      { type: String
      , validators: { all: [validity.required] }
      }
    })
}