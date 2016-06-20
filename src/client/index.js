'use strict';

let Query = require('./lib/query');
let Restypie = require('../../');

module.exports = class Client {

  get url() { return Restypie.Url.join(this.host, this.version, this.path); }

  constructor(options) {
    Object.assign(this, options);
    if (typeof this.host !== 'string') throw new Error('`options.host` is mandatory');
    if (typeof this.path !== 'string') throw new Error('`options.path` is mandatory');
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
        headers: Object.assign({ 'Accept': 'application/json', 'Content-Type': 'application/json' }, params.headers)
      }).run().then(function (body) {
        results.push(body.data);
        return Promise.resolve();
      });
    })).then(() => {
      return Promise.resolve(isArray ? results : results[0]);
    });
  }

  find(params) {
    params = params || {};
    return new Query({
      method: Restypie.Methods.GET,
      filters: params.filters,
      limit: params.limit,
      offset: params.offset,
      populate: params.populate,
      select: params.select,
      sort: params.sort,
      url: this.url,
      headers: Object.assign({ 'Accept': 'application/json' }, params.headers)
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
      headers: Object.assign({ 'Accept': 'application/json' }, params.headers)
    }).run().then((body) => {
      return Promise.resolve(body.data);
    });
  }

  findOne(params) {
    params = params || {};
    return new Query({
      method: Restypie.Methods.GET,
      filters: params.filters,
      limit: 1,
      offset: 0,
      sort: params.sort,
      populate: params.populate,
      select: params.select,
      url: this.url,
      headers: Object.assign({ 'Accept': 'application/json' }, params.headers)
    }).run().then((body) => {
      return Promise.resolve(body.data[0]);
    });
  }

  deleteById(id, params) {
    params = params || {};
    return new Query({
      method: Restypie.Methods.DELETE,
      url: Restypie.Url.join(this.url, id),
      headers: params.headers
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
      headers: Object.assign({ 'Content-Type': 'application/json' }, params.headers)
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
      headers: Object.assign({ 'Content-Type': 'application/json' }, params.headers)
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
      headers: Object.assign({ 'Accept': 'application/json' }, params.headers)
    }).run().then((body) => {
      return Promise.resolve(body.meta.total);
    });
  }

};