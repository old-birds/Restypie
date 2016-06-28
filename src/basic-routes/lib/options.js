'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let Restypie = require('../../');

/***********************************************************************************************************************
 * @namespace Restypie.BasicRoutes
 * @class OptionsRoute
 * @extends Restypie.Route
 * @constructor
 **********************************************************************************************************************/
module.exports = class OptionsRoute extends Restypie.Route {

  get method() { return Restypie.Methods.OPTIONS; }
  get path() { return '/'; }

  handler(bundle) {
    let resource = this.context.resource;
    bundle
      .setData(resource.getSchemaDescription())
      .setStatusCode(Restypie.Codes.OK);
    return resource.respond(bundle);
  }

};