'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let Restypie = require('../../');

/***********************************************************************************************************************
 * @namespace Restypie.RestErrors
 * @class Forbidden
 * @extends Restypie.RestErrors.AbstractRestError
 * @constructor
 **********************************************************************************************************************/
module.exports = class ForbiddenError extends Restypie.RestErrors.AbstractRestError {
  get name() { return 'ForbiddenError'; }
  get statusCode() { return Restypie.Codes.Forbidden; }
};
