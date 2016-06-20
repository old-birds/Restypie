'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let Restypie = require('../../../');

/***********************************************************************************************************************
 * @namespace Restypie.RestErrors
 * @class NotAcceptable
 * @extends Restypie.RestErrors.AbstractRestError
 * @constructor
 **********************************************************************************************************************/
module.exports = class NotAcceptableError extends Restypie.RestErrors.AbstractRestError {
  get name() { return 'NotAcceptableError'; }
  get statusCode() { return Restypie.Codes.NotAcceptable; }
};