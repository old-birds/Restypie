'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let Restypie = require('../../');

/***********************************************************************************************************************
 * @namespace Restypie.RestErrors
 * @class GatewayTimeOut
 * @extends Restypie.RestErrors.AbstractRestError
 * @constructor
 **********************************************************************************************************************/
module.exports = class GatewayTimeOutError extends Restypie.RestErrors.AbstractRestError {
  get name() { return 'GatewayTimeOutError'; }
  get statusCode() { return Restypie.Codes.GatewayTimeOut; }
};
