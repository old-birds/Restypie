'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let Restypie = require('../../');

/***********************************************************************************************************************
 * @namespace Restypie.RestErrors
 * @class ServiceUnavailable
 * @extends Restypie.RestErrors.AbstractRestError
 * @constructor
 **********************************************************************************************************************/
module.exports = class ServiceUnavailableError extends Restypie.RestErrors.AbstractRestError {
  get name() { return 'ServiceUnavailableError'; }
  get statusCode() { return Restypie.Codes.ServiceUnavailable; }
};
