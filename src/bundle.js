'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let _ = require('lodash');
let QS = require('querystring');
let URL = require('url');

let Restypie = require('./');

/***********************************************************************************************************************
 * @namespace Restypie
 * @class Bundle
 * @constructor
 **********************************************************************************************************************/
module.exports = class Bundle {

  get req() { return this._req; }

  get res() { return this._res; }

  get url() { return this._url; }

  get body() { return this._body; }

  get query() { return this._query; }

  get params() { return this._params; }

  get headers() { return this._headers; }

  get populate() { return this._populate; }
  
  get options() { return this._options; }

  get statusCode() { return this._statusCode; }
  get limit() { return this._limit; }
  get offset() { return this._offset; }

  get isError() { return this._isError; }

  get meta() { return this._meta; }

  get data() { return this._data; }

  get code() { return this._code; }
  get format() { return this._format; }

  get filters() { return this._filters; }
  get nestedFilters() { return this._nestedFilters; }
  get select() { return this._select; }
  get sort() { return this._sort; }

  get isRead() { return this._isRead; }
  get isUpdate() { return this._isUpdate; }
  get isWrite() { return this._isWrite; }
  get isDelete() { return this._isDelete; }
  
  get hasNestedFilters() { return !!Object.keys(this._nestedFilters || {}).length; }

  next(err) {
    return err ? Promise.reject(err) : Promise.resolve(this);
  }

  get payload() {
    let defaultPayload = _.pick({
      error: this._isError,
      message: this._message,
      code: this._code,
      meta: this._meta,
      data: this._data
    }, function (val) {
      return !_.isUndefined(val);
    });
    return Object.assign(defaultPayload, this._payload || {});
  }

  constructor(options) {
    this._req = options.req;
    this._res = options.res;
    this._query = 'object' === typeof this._req.query ? this._req.query : QS.parse(this._req.query);
    this._body = {};
    this._params = this._req.params;
    this._headers = {};
    this._statusCode = Restypie.Codes.Accepted;
    this._url = URL.parse(this._req.url);

    switch (this._req.method) {
      case 'POST':
        this._isWrite = true;
        break;
      case 'DELETE':
        this._isDelete = true;
        break;
      case 'PATCH':
        this._isUpdate = true;
        break;
      case 'GET':
        this._isRead = true;
        break;
      case 'PUT':
        this._isWrite = true;
        break;
      default:
        this._isRead = true;
    }

    this.emptyPayload();
  }

  setData(data) {
    this._data = data;
    return this;
  }

  setPayload(payload) {
    this._payload = payload;
    return this;
  }

  assignToPayload(obj) {
    if (!this._payload) this._payload = {};
    Object.assign(this._payload, obj);
    return this;
  }

  assignToHeaders(obj) {
    Object.assign(this._headers, obj);
    return this;
  }

  resetPayload() {
    this._payload = undefined;
    return this;
  }

  emptyPayload() {
    this._isError = undefined;
    this._meta = undefined;
    this._data = undefined;
    this._code = undefined;
    this._message = undefined;
    return this;
  }

  assignToQuery(obj) {
    Object.assign(this._query, obj);
    return this;
  }

  setStatusCode(statusCode) {
    this._statusCode = statusCode;
    return this;
  }

  setQuery(query) {
    this._query = query;
    return this;
  }
  
  setOptions(options) {
    this._options = options || [];
    return this;
  }
  
  hasOption(option) {
    return _.contains(this._options, option);
  }

  setMessage(message) {
    this._message = message;
    return this;
  }

  setCode(code) {
    this._code = code;
    return this;
  }

  setError(err) {
    err = Restypie.RestErrors.toRestError(err);
    this.err = err;
    this.resetPayload()
      .emptyPayload()
      .setStatusCode(err.statusCode)
      .setMessage(err.message)
      .setCode(err.code || err.name)
      .setMeta(err.meta);
    this._isError = true;
    return this;
  }

  assignToMeta(key, value) {
    if (!_.isPlainObject(this._meta)) this._meta = {};
    if (_.isPlainObject(key)) Object.assign(this._meta, key);
    else this._meta[key] = value;
    return this;
  }

  setMeta(obj) {
    this._meta = obj;
    return this;
  }

  setPopulate(fields) {
    this._populate = Array.isArray(fields) ? fields : [fields];
    return this;
  }

  setSelect(select) {
    this._select = Array.isArray(select) ? select : [select];
  }


  setLimit(value) {
    this._limit = value;
    return this;
  }

  setOffset(value) {
    this._offset = value;
    return this;
  }

  setFormat(format) {
    this._format = format;
    return this;
  }

  setFilters(filters) {
    this._filters = filters;
    return this;
  }

  mergeToFilters(filters) {
    const prev = this._filters = this._filters || {};
    for (const key in filters) {
      const prevOperators = prev[key] = prev[key] || {};
      const newOperators = filters[key];
      for (const newOperator in newOperators) {
        if (newOperator in prevOperators) {
          switch (true) {
            case Array.isArray(newOperators[newOperator]):
              prevOperators[newOperator] = _.uniq(prevOperators[newOperator].concat(newOperators[newOperator]));
              break;
            default:
              prevOperators[newOperator] = newOperators[newOperator];
              break
          }
        } else {
          prevOperators[newOperator] = newOperators[newOperator];
        }
      }
    }
    return this;
  }

  setNestedFilters(filters) {
    this._nestedFilters = filters;
    return this;
  }

  setBody(body) {
    this._body = body;
    return this;
  }

  setSort(fields) {
    this._sort = Array.isArray(fields) ? fields : [fields];
    return this;
  }

  /**
   * Builds navigation links.
   *
   * @method getNavLinks
   * @param {Number} total
   * @return {Object}
   */
  getNavLinks(total) {
    if (!_.isNumber(total)) throw new TypeError(`getNavLinks expects a number, got ${total}`);

    let limit = this.limit;
    let offset = this.offset;

    let next = null;
    let prev = null;

    let nextOffset = offset + limit;
    let prevOffset = offset - limit;

    if (nextOffset < total) next = this._getNavLink(limit, nextOffset);
    if (prevOffset >= 0 && prevOffset < total) prev = this._getNavLink(limit, prevOffset);

    return { next: next, prev: prev };
  }


  _getNavLink(limit, offset) {
    let queryString = QS.stringify(Object.assign({}, this.query, { limit: limit, offset: offset }));
    return this._url.pathname + '?' + QS.unescape(queryString);
  }

};