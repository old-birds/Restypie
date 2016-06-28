'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let Restypie = require('../../');

/***********************************************************************************************************************
 * @namespace Restypie.RestErrors
 * @class Unauthorized
 * @extends Restypie.RestErrors.AbstractRestError
 * @constructor
 **********************************************************************************************************************/
module.exports = class UnauthorizedError extends Restypie.RestErrors.AbstractRestError {
  get name() { return 'UnauthorizedError'; }
  get statusCode() { return Restypie.Codes.Unauthorized; }
};