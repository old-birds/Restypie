'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let Restypie = require('../../../');

/***********************************************************************************************************************
 * @namespace Restypie.RestErrors
 * @class AbstractRestError
 * @extends Error
 * @constructor
 * @param {String} message
 **********************************************************************************************************************/
module.exports = class AbstractRestError extends Error {

  /**
   * @attribute name
   * @type String
   * @final
   */
  get name() { return 'Error'; }

  /**
   * @attribute statusCode
   * @type Number
   * @final
   */
  get statusCode() { return null; }

  /**
   * @constructor
   */
  constructor(message, meta) {
    super(message);
    Restypie.Utils.forceAbstract(this, AbstractRestError);
    if (meta) this.meta = meta;
    if (!this.code) this.code = this.name;
  }
};