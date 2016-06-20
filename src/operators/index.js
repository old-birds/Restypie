'use strict';

/***********************************************************************************************************************
 * @namespace Restypie
 * @class Operators
 **********************************************************************************************************************/
module.exports = {
  get AbstractOperator() { return require('./lib/abstract-operator'); },
  get AbstractListOperator() { return require('./lib/abstract-list-operator'); },
  get Eq() { return require('./lib/eq'); },
  get Gt() { return require('./lib/gt'); },
  get Gte() { return require('./lib/gte'); },
  get In() { return require('./lib/in'); },
  get Lt() { return require('./lib/lt'); },
  get Lte() { return require('./lib/lte'); },
  get Ne() { return require('./lib/ne'); },
  get Nin() { return require('./lib/nin'); }
};