'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let Restypie = require('../../../');

/***********************************************************************************************************************
 * @namespace Restypie.RestErrors
 * @class InternalServerError
 * @extends Restypie.RestErrors.AbstractRestError
 * @constructor
 **********************************************************************************************************************/
module.exports = class InternalServerError extends Restypie.RestErrors.AbstractRestError {
  get name() { return 'InternalServerError'; }
  get statusCode() { return Restypie.Codes.InternalServerError; }
};