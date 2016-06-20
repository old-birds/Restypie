'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let Restypie = require('../../../');

/***********************************************************************************************************************
 * @namespace Restypie.RestErrors
 * @class BadRequest
 * @extends Restypie.RestErrors.AbstractRestError
 * @constructor
 **********************************************************************************************************************/
module.exports = class BadRequestError extends Restypie.RestErrors.AbstractRestError {
  get name() { return 'BadRequestError'; }
  get statusCode() { return Restypie.Codes.BadRequest; }
};
