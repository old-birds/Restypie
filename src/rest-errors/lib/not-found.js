'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let Restypie = require('../../');

/***********************************************************************************************************************
 * @namespace Restypie.RestErrors
 * @class NotFound
 * @extends Restypie.RestErrors.AbstractRestError
 * @constructor
 **********************************************************************************************************************/
module.exports = class NotFoundError extends Restypie.RestErrors.AbstractRestError {
  get name() { return 'NotFoundError'; }
  get statusCode() { return Restypie.Codes.NotFound; }
};
