'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
const PROTOCOL_REG = /^(file:\/|(http(s)?|s?ftp|smb):)(\/){2}/i;
const HTTP_PROTOCOL_REG = /^http(s)?:\/{2}/i;


/***********************************************************************************************************************
 * @namespace Restypie
 * @class Url
 **********************************************************************************************************************/
module.exports = {

  /**
   * Joins urls and preserves protocol.
   *
   * @method join
   * @static
   * @param {...String} parts
   * @return {String}
   */
  join() {
    let args = Array.prototype.slice.call(arguments, 0);
    let ret = args.join('/');
    let protocol = ret.match(PROTOCOL_REG);
    protocol = protocol ? protocol[0] : '';
    ret = ret.replace(protocol, '');
    if (protocol) ret = ret.replace(/^\/+/, '');
    return protocol + ret.replace(/\/{2,}/g, '/');
  },

  /**
   * Makes sure an HTTP protocol is present by adding it if need be.
   *
   * @method ensureHTTPProtocol
   * @static
   * @param {String} url
   * @param {Boolean} [useHTTPS] Make sure the resulting protocol is HTTPs
   * @return {String}
   */
  ensureHTTPProtocol(url, useHTTPS) {
    let forceProtocol = useHTTPS !== undefined;
    let protocol = url.match(HTTP_PROTOCOL_REG);
    protocol = protocol ? protocol[0] : '';
    if (protocol) url = url.replace(protocol, '');
    else protocol = ['http', useHTTPS ? 's' : '', '://'].join('');
    if (useHTTPS) protocol = protocol.replace(/^http(s)?/, 'https');
    else if (forceProtocol) protocol = protocol.replace(/^http(s)?/, 'http');
    return this.join(protocol, url);
  }
};