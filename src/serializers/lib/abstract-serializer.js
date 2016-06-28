'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let Restypie = require('../../');

/***********************************************************************************************************************
 * Abstract serializer class.
 *
 * @namespace Restypie.Serializers
 * @class AbstractSerializer
 * @constructor
 * @static
 **********************************************************************************************************************/
module.exports = class AbstractSerializer {

  constructor() {
    Restypie.Utils.forceStatic(this, AbstractSerializer);
  }

  static serialize(content) {
    return Promise.resolve(content);
  }

  static get mimeType() { return '*/*'; }
  static get aliases() { return []; }
};