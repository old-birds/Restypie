'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let Restypie = require('../../');

/***********************************************************************************************************************
 * @namespace Restypie.Fields
 * @class ToOneField
 * @extends Restypie.Fields.AbstractRelationField
 * @constructor
 **********************************************************************************************************************/
class ToOneField extends Restypie.Fields.AbstractRelationField {
  constructor(key, options) {
    super(key, options);
    if (this._toKey && this._fromKey) throw new Error(`Ambiguous ToOneField, cannot have both fromKey and toKey.`);
  }
}

module.exports = ToOneField;
