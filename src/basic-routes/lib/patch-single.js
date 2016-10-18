'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
const Promise = require('bluebird');

let Restypie = require('../../');

/***********************************************************************************************************************
 * @namespace Restypie.BasicRoutes
 * @class PatchSingleRoute
 * @extends Restypie.Route
 * @constructor
 **********************************************************************************************************************/
module.exports = class PatchSingleRoute extends Restypie.Route {

  get method() { return Restypie.Methods.PATCH; }
  get path() { return '/:pk'; }

  handler(bundle) {
    let pk;
    let resource = this.context.resource;
    let pkField = resource.primaryKeyField;

    return Promise.try(function () {
      pk = pkField.hydrate(bundle.params.pk);
      resource.parseOptions(bundle);
      bundle.setQuery({ [pkField.key]: pk });
      resource.parseFilters(bundle);
      return bundle.next();
    }).then(resource.parseBody.bind(resource, bundle))
      .then(resource.hydrate.bind(resource))
      .then(resource.validate.bind(resource))
      .then(resource.updateObject.bind(resource))
      .then(function (count) {
        if (!Restypie.Utils.isValidNumber(count)) {
          return bundle.next(new Error('updateObject should resolve with an integer'));
        }
        if (count <= 0) return bundle.next(new Restypie.TemplateErrors.ResourceNotFound({ pk }));

        return bundle
          .emptyPayload()
          .setMeta({ total: count })
          .setStatusCode(Restypie.Codes.NoContent)
          .next();
      })
      .catch (function (err) {
        return bundle.setError(err).next();
      })
      .then(resource.respond.bind(resource));
  }

};