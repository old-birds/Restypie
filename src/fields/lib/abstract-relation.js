'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let Restypie = require('../../../');

/***********************************************************************************************************************
 * @namespace Restypie.Fields
 * @class AbstractRelationField
 * @extends Restypie.Fields.AnyField
 * @constructor
 **********************************************************************************************************************/
class AbstractRelationField extends Restypie.Fields.AnyField {

  get isRelation() { return true; }
  get isManyRelation() { return false; }

  constructor(key, options) {
    super(key, options);
    Restypie.Utils.forceAbstract(this, AbstractRelationField, true);
  }
}

module.exports = AbstractRelationField;