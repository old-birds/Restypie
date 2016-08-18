'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
const Restypie = require('../../');

/***********************************************************************************************************************
 * @namespace Restypie.RestErrors
 * @class Forbidden
 * @extends Restypie.RestErrors.AbstractRestError
 * @constructor
 **********************************************************************************************************************/
module.exports = class ConflictError extends Restypie.RestErrors.AbstractRestError {
  get name() { return 'ConflictError'; }
  get statusCode() { return Restypie.Codes.Conflict; }
};
