'use strict';

const Path = require('path');

const testSuitePath = Path.resolve(__dirname, '../test/resource-test-suite');

class ResourceTester {

  static validate(resourceClass, options) {
    options = options || {};
    require(testSuitePath)(Object.assign({}, options, {
      resource: resourceClass
    }));
  }

}


module.exports = ResourceTester;