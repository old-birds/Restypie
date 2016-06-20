'use strict';

const METHODS = {

  /**
   * @property GET
   * @static
   * @final
   * @type {String}
   */
  GET: 'GET',
  /**
   * @property POST
   * @static
   * @final
   * @type {String}
   */
  POST: 'POST',
  /**
   * @property PUT
   * @static
   * @final
   * @type {String}
   */
  PUT: 'PUT',
  /**
   * @property PATCH
   * @static
   * @final
   * @type {String}
   */
  PATCH: 'PATCH',
  /**
   * @property DELETE
   * @static
   * @final
   * @type {String}
   */
  DELETE: 'DELETE',
  /**
   * @property OPTIONS
   * @static
   * @final
   * @type {String}
   */
  OPTIONS: 'OPTIONS',
  /**
   * @property HEAD
   * @static
   * @final
   * @type {String}
   */
  HEAD: 'HEAD'

};

/***********************************************************************************************************************
 * List of symbols representing HTTP methods.
 *
 * @namespace Restypie
 * @class Methods
 **********************************************************************************************************************/
module.exports = Object.assign({

  /**
   * Enumeration of methods (useful for iterations).
   *
   * @attribute METHODS
   * @type Object
   * @final
   * @static
   */
  get METHODS() { return METHODS; },


  isSupportedMethod(method) {
    return typeof method === 'string' && !!Object.keys(METHODS).some((key) => {
      return METHODS[key] === method.toUpperCase();
    });
  }


}, METHODS);