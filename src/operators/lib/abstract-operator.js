'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let Restypie = require('../../');

/***********************************************************************************************************************
 * @namespace Restypie.Operators
 * @class AbstractOperator
 **********************************************************************************************************************/
module.exports = class AbstractOperator {
  constructor() {
    Restypie.Utils.forceStatic(this, AbstractOperator, true);
  }

  static get stringName() { return this.name.toLowerCase(); }

  static parse(value) {
    return value;
  }
};