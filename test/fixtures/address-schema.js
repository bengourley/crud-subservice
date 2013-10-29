module.exports = createSchema

var schemata = require('schemata')
  , validity = require('validity')
  , uid = require('hat')

function createSchema() {

  return schemata(

    // *NOT* a Mongo id, but named with underscore for familiarity
    { _id:
      { type: String
      , defaultValue: function () { return uid() }
      }

    , fullName:
      { type: String
      , validators: { all: [ validity.required ] }
      }

      // An array of address lines, with a minimum length of 1
    , addressLines:
      { type: Array
      , validators: { all: [ validity.length(1, Infinity) ] }
      }

      // Country agnostic property name. Refers to county (uk), state (us), province (fr), etc…
    , region:
      { type: String
      , validators: { all: [ validity.required ] }
      }

    , country:
      { type: String
      , validators: { all: [ validity.required ] }
      }

    , postalCode:
      { type: String
      , validators: { all: [ validity.required ] }
      }

    })

}