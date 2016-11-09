'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let Restypie = require('../');

/***********************************************************************************************************************
 * @namespace Restypie
 * @class RestErrors
 **********************************************************************************************************************/
module.exports = {

  /**
   * Ensure that the returned value is a `Restypie.RestErrors.AbstractRestError`. Defaults to an InternalServerError.
   *
   * @method toRestError
   * @static
   * @param {Error} err
   * @return {RestError}
   */
  toRestError(err) {
    let restErr;
    if (err instanceof this.AbstractRestError) restErr = err;
    else {
      restErr = new this.InternalServerError(err.message);
      restErr.stack = err.stack;
    }
    return restErr;
  },

  fromStatusCode(statusCode, message, meta) {
    let self = this;
    let errorClassName = Object.keys(this).find(function (key) {
      let item = self[key];
      if (Restypie.Utils.isSubclassOf(item, self.AbstractRestError) && item.prototype.statusCode === statusCode) {
        return key;
      }
    }) || 'InternalServerError';
    return new this[errorClassName](message, meta);
  },

  get AbstractRestError() { return require('./lib/abstract-rest-error'); },
  get InternalServerError() { return require('./lib/internal-server-error'); },
  get BadRequest() { return require('./lib/bad-request'); },
  get NotFound() { return require('./lib/not-found'); },
  get Forbidden() { return require('./lib/forbidden'); },
  get NotImplemented() { return require('./lib/not-implemented'); },
  get UnsupportedMediaType() { return require('./lib/unsupported-media-type'); },
  get NotAcceptable() { return require('./lib/not-acceptable'); },
  get Unauthorized() { return require('./lib/unauthorized'); },
  get Conflict() { return require('./lib/conflict'); },
  get GatewayTimeOut() { return require('./lib/gateway-timeout'); },
  get ServiceUnavailable() { return require('./lib/service-unavailable'); }

};
