'use strict';

let request = require('request');
const debug = require('debug')('restypie:query');

let Restypie = require('../../');

module.exports = class Query {

  get isError() { return !Restypie.Utils.isNone(this.err); }

  constructor(options) {
    if (!options) throw new Error('No `options` passed to instantiate a Query');
    if (!options.url) throw new Error('`options.url` is mandatory');

    this._url = options.url;
    this._method = options.method || 'GET';
    this._filters = options.filters || {};
    this._limit = (typeof options.limit === 'number') ? options.limit : null;
    this._offset = options.offset || null;
    this._populate = options.populate || [];
    this._headers = options.headers || {};
    this._select = options.select || [];
    this._options = options.options || [];
    this._hasBeenRan = false;
    this._body = options.body;
    this.data = null;
    this.meta = null;
    this.err = null;
  }

  run() {

    return new Promise((resolve, reject) => {
      if (this._hasBeenRan) return reject(new Error('A `Query` can only be ran once'));

      this.options = {
        method: this._method,
        url: this._url,
        headers: this._headers,
        qs: this._buildQueryString(),
        body: this._body,
        json: true,
        gzip: true
      };

      debug(`run => ${this.options.method} ${this.options.url}\n` +
            `query: ${JSON.stringify(this.options.qs)}\n` +
            `headers: ${JSON.stringify(this.options.headers)}\n` +
            `body: ${JSON.stringify(this.options.body)}`
      );
      return request(this.options, (err, res, body) => {
        this._hasBeenRan = true;
        body = body || {};
        this.meta = body.meta || {};
        if (err || Restypie.Codes.isErrorCode(res.statusCode)) {
          this.err = err = err || Restypie.RestErrors.fromStatusCode(res.statusCode, body.message, body.meta);
          return reject(err);
        }
        this.data = body.data;
        return resolve(body);
      });

    });

  }

  _buildQueryString() {
    return Restypie.stringify({
      filters: this._filters,
      select: this._select,
      populate: this._populate,
      limit: this._limit,
      offset: this._offset,
      options: this._options
    });
  }

};
