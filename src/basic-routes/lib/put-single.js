'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let Promise = require('bluebird'); 
 
let Restypie = require('../../../');

/***********************************************************************************************************************
 * @namespace Restypie.BasicRoutes
 * @class PutSingleRoute
 * @extends Restypie.Route
 * @constructor
 **********************************************************************************************************************/
module.exports = class PutSingleRoute extends Restypie.Route {

  get method() { return Restypie.Methods.PUT; }
  get path() { return '/'; }

  handler(bundle) {
    let resource = this.context.resource;

    return resource.parseOptions(bundle)
      .then(resource.parseBody.bind(resource, bundle))
      .then(resource.hydrate.bind(resource, bundle))
      .then(function (bundle) {
        // Check if filters match values in body
        return Promise.try(function () {
          let upsertPaths = resource.upsertPaths;
          let filters = bundle.filters;
          let directFilters = Object.keys(filters).reduce((acc, key) => {
            if (filters[key].hasOwnProperty('eq')) {
              acc[key] = filters[key].eq;
            }
            return acc;
          }, {});
          let body = bundle.body;
          
          let fulfillsAnyAssociation = false;
          if (!upsertPaths.length) throw new Error('No upsertPaths defined, request is rejected for security');
          for (let association of upsertPaths) {
            if (!Array.isArray(association)) throw new Error('upsertPaths must be an array of arrays');
            if (!association.length) throw new Error('Empty association in upsertPaths');
            let fulfillsCurrentAssociation = true;
            for (let key of association) {
              if (!directFilters.hasOwnProperty(key)) {
                fulfillsCurrentAssociation = false;
                break;
              }
            }
            
            if (fulfillsCurrentAssociation) {
              fulfillsAnyAssociation = true;
              break;
            }
          }
          
          if (!fulfillsAnyAssociation) throw new Restypie.TemplateErrors.RequestOutOfRange();
          
          for (let key in directFilters) {
            let filterValue = directFilters[key];
            let bodyValue = body[key];  
            if (body.hasOwnProperty(key) && directFilters[key] !== body[key]) {
              throw new Restypie.TemplateErrors.InconsistentRequest({ key, filterValue, bodyValue });
            }
            if (resource.requiredFields.find((field) => field.key === key)) {
              bundle.body[key] = filterValue;
            }
          }
        });
      })
      .then(resource.validate.bind(resource, bundle))
      .then(resource.upsertObject.bind(resource, bundle))
      .then(function (result) {
        if (!result) return Promise.reject(new Error('upsertObject must return an object'));
        if (!result.hasOwnProperty('object')) return Promise.reject(new Error('result.object must be defined'));

        return bundle
          .emptyPayload()
          .setData(result.object)
          .setStatusCode(result.isCreated ? Restypie.Codes.Created : Restypie.Codes.OK)
          .next();
      })
      .then(resource.dehydrate.bind(resource))
      .catch (function (err) {
        return bundle.setError(err).next();
      })
      .then(resource.respond.bind(resource));
  }

};