'use strict';

const Query = require('./lib/query');
const Restypie = require('../');

const ReturnTypes = {
  BODY: 'body',
  DATA: 'data',
  META: 'meta'
};

module.exports = class Client {

  get url() { return Restypie.Url.join(this._host, this._version, this._path); }
  get defaultHeaders() { return this._defaultHeaders; }
  get host() { return this._host; }
  get path() { return this._path; }
  get version() { return this._version; }

  constructor(options) {
    options = options || {};
    this._host = options.host;
    this._path = options.path;
    if (typeof this._host !== 'string') throw new Error('`options.host` is mandatory');
    if (typeof this._path !== 'string') throw new Error('`options.path` is mandatory');
    this._version = options.version || '';
    this._defaultHeaders = options.defaultHeaders || {};
  }

  create(props, params) {
    let isArray = Array.isArray(props);
    if (!isArray) props = [props];
    params = params || {};

    let results = [];

    return Promise.all(props.map((object) => {
      return new Query({
        method: Restypie.Methods.POST,
        body: object,
        options: params.options,
        url: this.url,
        headers: Object.assign({
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }, this._defaultHeaders, params.headers)
      }).run().then((body) => {
        results.push(body.data);
        return Promise.resolve();
      });
    })).then(() => {
      return Promise.resolve(isArray ? results : results[0]);
    });
  }

  find(filters, params) {
    params = params || {};
    return new Query({
      method: Restypie.Methods.GET,
      filters: filters,
      limit: params.limit,
      offset: params.offset,
      populate: params.populate,
      select: params.select,
      options: params.options,
      sort: params.sort,
      url: this.url,
      headers: Object.assign({ 'Accept': 'application/json' }, this._defaultHeaders, params.headers)
    }).run().then((body) => {
      return Promise.resolve(Client.extractReturn(body, params.returnType));
    });
  }

  findById(id, params) {
    params = params || {};
    return new Query({
      method: Restypie.Methods.GET,
      populate: params.populate,
      options: params.options,
      select: params.select,
      url: Restypie.Url.join(this.url, id),
      headers: Object.assign({ 'Accept': 'application/json' }, this._defaultHeaders, params.headers)
    }).run().then((body) => {
      return Promise.resolve(body.data);
    });
  }

  findOne(filters, params) {
    params = params || {};
    return new Query({
      method: Restypie.Methods.GET,
      filters: filters,
      limit: 1,
      offset: 0,
      sort: params.sort,
      populate: params.populate,
      options: params.options,
      select: params.select,
      url: this.url,
      headers: Object.assign({ 'Accept': 'application/json' }, this._defaultHeaders, params.headers)
    }).run().then((body) => {
      return Promise.resolve(body.data[0]);
    });
  }

  deleteById(id, params) {
    params = params || {};
    return new Query({
      method: Restypie.Methods.DELETE,
      options: params.options,
      url: Restypie.Url.join(this.url, id),
      headers: Object.assign({}, this._defaultHeaders, params.headers)
    }).run().then(() => undefined);
  }

  updateById(id, updates, params) {
    params = params || {};
    return new Query({
      method: Restypie.Methods.PATCH,
      body: updates,
      url: Restypie.Url.join(this.url, id),
      headers: Object.assign({ 'Content-Type': 'application/json' }, this._defaultHeaders, params.headers)
    }).run().then(() => undefined);
  }

  update(filters, updates, params) {
    params = params || {};
    return new Query({
      method: Restypie.Methods.PATCH,
      body: updates,
      options: params.options,
      filters,
      url: this.url,
      headers: Object.assign({ 'Content-Type': 'application/json' }, this._defaultHeaders, params.headers)
    }).run().then(() => undefined);
  }

  query(method, path, filters, params) {
    params = params || {};
    return new Query({
      method: method,
      filters: filters,
      limit: params.limit,
      offset: params.offset,
      sort: params.sort,
      populate: params.populate,
      options: params.options,
      select: params.select,
      url: path ? Restypie.Url.join(this.url, path) : this.url,
      headers: Object.assign({ 'Accept': 'application/json' }, this._defaultHeaders, params.headers)
    }).run().then((body) => {
      return Promise.resolve(body.data);
    });
  }

  count(filters, params) {
    params = params || {};
    return new Query({
      method: Restypie.Methods.GET,
      filters: filters,
      limit: 1,
      offset: 0,
      options: params.options,
      url: this.url,
      headers: Object.assign({ 'Accept': 'application/json' }, this._defaultHeaders, params.headers)
    }).run().then((body) => {
      return Promise.resolve(body.meta.total);
    });
  }

  getQueryScore(filters, params) {
    params = params || {};
    params.options = Restypie.Utils.makeArray(params.options);
    params.options.push(Restypie.QueryOptions.SCORE_ONLY);
    params.returnType = ReturnTypes.META;
    return this.find(filters, params).then((meta) => {
      return meta.score;
    });
  }

  static extractReturn(body, returnType) {
    switch (returnType) {
      case ReturnTypes.BODY: return body;
      case ReturnTypes.META: return body && body.meta;
      case ReturnTypes.DATA: return body && body.data;
      default: return body && body.data;
    }
  }

  static get ReturnTypes() { return ReturnTypes; }

};