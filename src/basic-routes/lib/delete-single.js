'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let Promise = require('bluebird');

let Restypie = require('../../../');

/***********************************************************************************************************************
 * @namespace Restypie.BasicRoutes
 * @class DeleteSingleRoute
 * @extends Restypie.Route
 * @constructor
 **********************************************************************************************************************/
module.exports = class DeleteSingleRoute extends Restypie.Route {

  get method() { return Restypie.Methods.DELETE; }
  get path() { return '/:pk'; }

  handler(bundle) {
    let pk;
    let resource = this.context.resource;
    let pkField = resource.primaryKeyField;

    return Promise.try(function () {
      pk = pkField.hydrate(bundle.params.pk);
      bundle.setQuery({ [pkField.key]: pk });
      resource.parseFilters(bundle);
    }).then(resource.deleteObject.bind(resource, bundle))
      .then(function (count) {
        if (!Restypie.Utils.isValidNumber(count)) {
          return bundle.next(new Error('deleteObject should resolve with an integer'));
        }
        if (count <= 0) return bundle.next(new Restypie.TemplateErrors.ResourceNotFound({ pk }));

        return bundle
          .emptyPayload()
          .setStatusCode(Restypie.Codes.NoContent)
          .next();
      })
      .catch (function (err) {
        return bundle.setError(err).next();
      })
      .then(resource.respond.bind(resource));
  }

};