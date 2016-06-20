'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let Restypie = require('../../../');

/***********************************************************************************************************************
 * @namespace Restypie.Operators
 * @class AbstractListOperator
 * @extends AbstractOperator
 **********************************************************************************************************************/
module.exports = class AbstractListOperator extends Restypie.Operators.AbstractOperator {

  static get SEPARATOR() { return /\s*,\s*/; }

  static parse(value) {
    return value.split(this.SEPARATOR);
  }
};