'use strict';

/***********************************************************************************************************************
 * @namespace Restypie
 * @class Serializers
 **********************************************************************************************************************/
module.exports = {
  get AbstractSerializer() { return require('./lib/abstract-serializer'); },
  get JSONSerializer() { return require('./lib/json'); }
};