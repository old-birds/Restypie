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
  
  static get filteringWeight() { return 10; }
  
  static get normalizedFilteringWeight() { return this.filteringWeight / 100; }

  static get stringName() { return this.name.toLowerCase(); }

  static parse(value) {
    return value;
  }
};