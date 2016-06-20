'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let Restypie = require('../../../');

/***********************************************************************************************************************
 * @namespace Restypie.Fields
 * @class ToManyField
 * @extends Restypie.Fields.AbstractRelationField
 * @constructor
 **********************************************************************************************************************/
class ToManyField extends Restypie.Fields.AbstractRelationField {
  get isManyRelation() { return true; }
}

module.exports = ToManyField;