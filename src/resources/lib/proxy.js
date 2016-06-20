'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let Restypie = require('../../../');
let _ = require('lodash');
let UrlValidator = require('valid-url');

/***********************************************************************************************************************
 * @namespace Restypie.Resources
 * @class ProxyResource
 * @constructor
 **********************************************************************************************************************/
module.exports = class ProxyResource extends Restypie.Resources.AbstractCoreResource {

  get targetUrl() { return null; }
  get targetHost() { return null; }
  get targetVersion() { return ''; }
  get targetPath() { return ''; }

  constructor(targetUrl) {
    super();
    if (_.isString(targetUrl)) this._targetUrl = targetUrl;
    else this._buildTargetUrl();
    if (!UrlValidator.isWebUri(this._targetUrl)) throw new Error('`targetUrl` is not a valid one : ' + this._targetUrl);
  }

  getFullUrl() {
    return this._targetUrl;
  }

  _buildTargetUrl() {
    let targetUrl = this.targetUrl;

    if (!_.isString(targetUrl)) {
      targetUrl = Restypie.Url.join(this.targetHost, this.targetVersion, this.targetPath);
      targetUrl = Restypie.Url.ensureHTTPProtocol(targetUrl);
    }

    this._targetUrl = targetUrl;
  }

};