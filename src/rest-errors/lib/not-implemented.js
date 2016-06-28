'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let Restypie = require('../../');

/***********************************************************************************************************************
 * @namespace Restypie.RestErrors
 * @class NotImplemented
 * @extends Restypie.RestErrors.AbstractRestError
 * @constructor
 **********************************************************************************************************************/
module.exports = class NotImplementedError extends Restypie.RestErrors.AbstractRestError {
  get name() { return 'NotImplementedError'; }
  get statusCode() { return Restypie.Codes.NotImplemented; }
};