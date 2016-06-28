'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let Restypie = require('../../');

/***********************************************************************************************************************
 * @namespace Restypie.BasicRoutes
 * @class PostRoute
 * @extends Restypie.Route
 * @constructor
 **********************************************************************************************************************/
module.exports = class PostRoute extends Restypie.Route {

  get method() { return Restypie.Methods.POST; }
  get path() { return '/'; }

  /**
   * Defines whether or not creating multiple objects at a time is allowed. If setting this property to `true`, the
   * target resource must implement the `createObjects` method.
   *
   * @property allowsMany
   * @type Boolean
   * @default false
   */
  get allowsMany() { return false; }

  handler(bundle) {
    let resource = this.context.resource;
    let allowsMany = this.allowsMany;

    return resource.parseBody(bundle)
      .then(function (bundle) {
        if (Array.isArray(bundle.body)) {
          if (!allowsMany) {
            let len = bundle.body.length;
            if (len > 1) {
              return bundle.next(new Restypie.RestErrors.Forbidden(`Can only create a single object, got ${len}`));
            }
            else bundle.body = bundle.body[0];
          }
        }
        return bundle.next();
      })
      .then(resource.hydrate.bind(resource))
      .then(resource.validate.bind(resource))
      .then(function (bundle) {
        if (Array.isArray(bundle.body)) return resource.createObjects(bundle);
        else return resource.createObject(bundle);
      })
      .then(function (data) {
        return bundle
          .setStatusCode(Restypie.Codes.Created)
          .setData(data)
          .next();
      })
      .then(resource.dehydrate.bind(resource))
      .catch (function (err) {
        return bundle.setError(err).next();
      })
      .then(resource.serialize.bind(resource))
      .then(resource.respond.bind(resource));
  }

};