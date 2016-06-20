'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let Restypie = require('../../../');

/***********************************************************************************************************************
 * @namespace Restypie.RestErrors
 * @class UnsupportedMediaType
 * @extends Restypie.RestErrors.AbstractRestError
 * @constructor
 **********************************************************************************************************************/
module.exports = class UnsupportedMediaTypeError extends Restypie.RestErrors.AbstractRestError {
  get name() { return 'UnsupportedMediaTypeError'; }
  get statusCode() { return Restypie.Codes.UnsupportedMediaType; }
};
