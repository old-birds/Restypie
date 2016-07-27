'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
const Promise = require('bluebird');

const Restypie = require('../../');

/***********************************************************************************************************************
 * @namespace Restypie.BasicRoutes
 * @class GetSingleRoute
 * @extends Restypie.Route
 * @constructor
 **********************************************************************************************************************/
module.exports = class GetSingleRoute extends Restypie.Route {

  get method() { return Restypie.Methods.GET; }
  get path() { return '/:pk'; }

  handler(bundle) {
    let pk;
    let resource = this.context.resource;
    let pkField = resource.primaryKeyField;

    return Promise.try(function () {
      pk = pkField.hydrate(bundle.params.pk);
      bundle.query[pkField.key] = pk;
      resource.parseOptions(bundle);
      resource.parseSelect(bundle);
      resource.parseFormat(bundle);
      resource.parseFilters(bundle);
      resource.parsePopulate(bundle);
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
      .then(resource.getObject.bind(resource, bundle))
      .then(function (object) {
        if (!object) return bundle.next(new Restypie.TemplateErrors.ResourceNotFound({ pk }));
        return bundle
          .setData(object)
          .setStatusCode(Restypie.Codes.OK)
          .next();
      })
      .then(resource.dehydrate.bind(resource))
      .then(resource.populate.bind(resource))
      .catch (function (err) {
        return bundle.setError(err).next();
      })
      .then(resource.serialize.bind(resource))
      .then(resource.respond.bind(resource));
  }

};