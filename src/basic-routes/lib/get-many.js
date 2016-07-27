'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
const Restypie = require('../../');
const Promise = require('bluebird');

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

    return Promise.try(function () {
      resource.parseOptions(bundle);
      resource.parseLimit(bundle);
      resource.parseSelect(bundle);
      resource.parseOffset(bundle);
      resource.parseFormat(bundle);
      resource.parseFilters(bundle);
      resource.parsePopulate(bundle);
      resource.parseSort(bundle);
      return bundle.next();
    })
      .then(() => {
        const shouldCalculateScore = bundle.hasOption(Restypie.QueryOptions.INCLUDE_SCORE) ||
          bundle.hasOption(Restypie.QueryOptions.SCORE_ONLY);

        if (shouldCalculateScore) {
          return resource.getQueryScore(bundle).then((score) => {
            return bundle.assignToMeta({ score }).next();
          });
        } else {
          return bundle.next();
        }
      })
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
      .then(function (bundle) {
        bundle.assignToMeta({ limit: bundle.limit, offset: bundle.offset });

        if (!bundle.hasOption(resource.options.NO_COUNT)) {
          return resource.countObjects(bundle).then(function (total) {
            return bundle
              .assignToMeta({ total })
              .assignToMeta(bundle.getNavLinks(total))
              .next();
          });
        }

        return bundle.next();
      })
      .catch (function (err) {
        return bundle.setError(err).next();
      })
      .then(resource.serialize.bind(resource))
      .then(resource.respond);
  }

};