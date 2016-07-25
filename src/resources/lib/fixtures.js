'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let _ = require('lodash');
let sortBy = require('sort-by');

let Restypie = require('../../');

/***********************************************************************************************************************
 * @namespace Restypie.Resources
 * @class FixturesResource
 * @constructor
 **********************************************************************************************************************/
module.exports = class FixturesResource extends Restypie.Resources.AbstractResource {

  get fixtures() { return this._fixtures; }
  get size() { return this._fixtures.length; }

  constructor(api) {
    super(api);
    this.resetObjects();
    Restypie.Utils.isInstanceOf(this._fixtures, Array, true);
  }

  countObjects(bundle) {
    return Promise.resolve(this.filterObjects(bundle).length);
  }

  resetObjects() {
    this._id = 0;
    this._fixtures = [];
  }

  filterObjects(bundle) {

    let filters = bundle.filters || {};

    return this.fixtures.filter(function (fixture) {
      let matches = true;

      for (let key in filters) {
        for (let filter in filters[key]) {
          let value = fixture[key];
          let filterValue = filters[key][filter];

          switch (filter) {
            case 'eq': matches &= value === filterValue; break;
            case 'ne': matches &= value !== filterValue; break;
            case 'in': matches &= _.contains(filterValue, value); break;
            case 'nin': matches &= !_.contains(filterValue, value); break;
            case 'gt': matches &= value > filterValue; break;
            case 'gte': matches &= value >= filterValue; break;
            case 'lt': matches &= value < filterValue; break;
            case 'lte': matches &= value <= filterValue; break;
          }
        }
      }

      return !!matches;
    });
  }

  createObject(bundle) {
    let data = bundle.body;
    data[this.primaryKeyField.path] = data[this.primaryKeyField.path] || ++this._id;
    this._fixtures.push(data);
    return Promise.resolve(data);
  }

  createObjects(bundle) {
    let self = this;
    return Promise.all(bundle.body.map(function (item) {
      return self.createObject({ body: item });
    }));
  }

  getObject(bundle, keepInstance) {
    let object = this.filterObjects(bundle)[0];
    return Promise.resolve(keepInstance ? object : object ? _.pick(object, bundle.select) : object);
  }

  getObjects(bundle, keepInstance) {
    let offset = bundle.offset;
    let objects = this.filterObjects(bundle);

    if (bundle.sort) objects.sort(sortBy.apply(sortBy, bundle.sort));

    let rightSlice = bundle.limit !== 0 ? offset + bundle.limit : undefined;

    return Promise.resolve(objects.slice(offset, rightSlice).map(function (object) {
      return keepInstance ? object : object ? _.pick(object, bundle.select) : object;
    }));
  }

  updateObject(bundle) {
    return this.getObject(bundle, true)
      .then(function (object) {
        if (!object) return Promise.resolve(0);
        Object.assign(object, bundle.body);
        return Promise.resolve(1);
      });
  }

  updateObjects(bundle) {
    bundle.setLimit(0); // All items
    return this.getObjects(bundle, true)
      .then(function (objects) {
        objects.forEach(function (object) {
          Object.assign(object, bundle.body);
        });
        return Promise.resolve(objects.length);
      });
  }

  deleteObject(bundle) {
    let fixtures = this._fixtures;
    return this.getObject(bundle, true)
      .then(function (object) {
        if (!object) return Promise.resolve(0);
        fixtures.splice(fixtures.indexOf(object), 1);
        return Promise.resolve(1);
      });
  }

  replaceObject() {
    return Promise.resolve();
  }


  reset() {
    if (process.env.NODE_ENV !== Restypie.TEST_ENV) {
      throw new Error('reset() is only intended to be used for Restypie internal testing');
    }
    this.resetObjects();
    return Promise.resolve();
  }

};