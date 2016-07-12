'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let Restypie = require('../../');

/***********************************************************************************************************************
 * @namespace Restypie.BasicRoutes
 * @class GetManyRoute
 * @extends Restypie.Route
 * @constructor
 **********************************************************************************************************************/
module.exports = class GetManyRoute extends Restypie.Route {

  get method() { return Restypie.Methods.GET; }
  get path() { return '/'; }

  handler(bundle) {
    let resource = this.context.resource;

    return resource.parseOptions(bundle)
      .then(resource.applyNestedFilters.bind(resource))
      .then(resource.getObjects.bind(resource))
      .then(function (objects) {
        if (!Array.isArray(objects)) return Promise.reject(new Error('getObjects should return an array'));
        return bundle
          .setData(objects)
          .setStatusCode(Restypie.Codes.OK)
          .next();
      })
      .then(resource.dehydrate.bind(resource))
      .then(resource.populate.bind(resource))
      .then(resource.countObjects.bind(resource))
      .then(function (total) {
        return bundle
          .assignToMeta({ total, limit: bundle.limit, offset: bundle.offset })
          .assignToMeta(bundle.getNavLinks(total))
          .next();
      })
      .catch (function (err) {
        // console.log(err.stack);
        return bundle.setError(err).next();
      })
      .then(resource.serialize.bind(resource))
      .then(resource.respond);
  }

};