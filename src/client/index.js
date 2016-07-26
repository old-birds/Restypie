'use strict';

let Query = require('./lib/query');
let Restypie = require('../');

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
      sort: params.sort,
      url: this.url,
      headers: Object.assign({ 'Accept': 'application/json' }, this._defaultHeaders, params.headers)
    }).run().then((body) => {
      return Promise.resolve(body.data);
    });
  }

  findById(id, params) {
    params = params || {};
    return new Query({
      method: Restypie.Methods.GET,
      populate: params.populate,
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
      url: Restypie.Url.join(this.url, id),
      headers: Object.assign({}, this._defaultHeaders, params.headers)
    }).run().then(() => {
      return Promise.resolve();
    });
  }

  updateById(id, updates, params) {
    params = params || {};
    return new Query({
      method: Restypie.Methods.PATCH,
      body: updates,
      url: Restypie.Url.join(this.url, id),
      headers: Object.assign({ 'Content-Type': 'application/json' }, this._defaultHeaders, params.headers)
    }).run().then(() => {
      return Promise.resolve();
    });
  }
  
  update(filters, updates, params) {
    params = params || {};
    return new Query({
      method: Restypie.Methods.PATCH,
      body: updates,
      filters,
      url: this.url,
      headers: Object.assign({ 'Content-Type': 'application/json' }, this._defaultHeaders, params.headers)
    }).run().then(() => {
      return Promise.resolve();
    });
  }

  count(filters, params) {
    params = params || {};
    return new Query({
      method: Restypie.Methods.GET,
      filters: filters,
      limit: 1,
      offset: 0,
      url: this.url,
      headers: Object.assign({ 'Accept': 'application/json' }, this._defaultHeaders, params.headers)
    }).run().then((body) => {
      return Promise.resolve(body.meta.total);
    });
  }

};