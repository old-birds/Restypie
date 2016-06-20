'use strict';

let Restypie = require('../../../');

module.exports = class RestypieResource extends Restypie.Resources.AbstractResource {
  
  get model() { return null; }
  
  constructor(api) {
    super(api);
    Restypie.Utils.isSubclassOf(this.model, Restypie.Model, true);
  }

  countObjects(bundle, options) {
    return this.model.count(bundle.filters, options);
  }

  createObject(bundle, options) {
    return this.model.create(bundle.body, options)
      .then(function (object) { return Promise.resolve(object.toJSON()); });
  }

  getObjects(bundle, options) {
    return this.model.find(bundle.filters, Object.assign(options || {}, {
      limit: bundle.limit,
      offset: bundle.offset,
      select: bundle.select,
      sort: bundle.sort
    })).then(function (objects) {
      return Promise.resolve(objects.map((object) => object.toJSON()));
    });
  }

  getObject(bundle, options) {
    return this.model.finById(bundle.req.params.pk, Object.assign(options || {}, {
      select: bundle.select
    })).then((object) => {
      return Promise.resolve(object.toJSON());
    });
  }

  updateObject(bundle, options) {
    return this.model.updateById(bundle.req.params.pk, bundle.body, options).then(() => {
      return Promise.resolve(1);
    });
  }

  deleteObject(bundle, options) {
    return this.model.deleteById(bundle.req.params.pk, options);
  }
  
};