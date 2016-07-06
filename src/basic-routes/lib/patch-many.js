'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let Promise = require('bluebird');

let Restypie = require('../../');

/***********************************************************************************************************************
 * @namespace Restypie.BasicRoutes
 * @class PatchSingleRoute
 * @extends Restypie.Route
 * @constructor
 **********************************************************************************************************************/
module.exports = class PatchSingleRoute extends Restypie.Route {

  get method() { return Restypie.Methods.PATCH; }
  get path() { return '/'; }

  handler(bundle) {
    let resource = this.context.resource;

    return Promise.try(function () {
      resource.parseOptions(bundle);
      // Do not allow to update the whole table - empty filters
      if (!Object.keys(bundle.filters).length) throw new Restypie.TemplateErrors.RequestOutOfRange(bundle.filters);
    }).then(resource.parseBody.bind(resource, bundle))
      .then(resource.hydrate.bind(resource))
      .then(resource.validate.bind(resource))
      .then(resource.updateObjects.bind(resource))
      .then(function (count) {
        if (!Restypie.Utils.isValidNumber(count)) {
          return bundle.next(new Error('updateObjects should resolve with an integer'));
        }

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