'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
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
    const resource = this.context.resource;
    const pipeline = bundle.createPipeline(resource.exit, resource);
    let pk;
    let pkField = resource.primaryKeyField;

    return pipeline
      .add(resource.authorize)
      .add((bundle) => {
        pk = pkField.hydrate(bundle.params.pk);
        bundle.query[pkField.key] = pk;
        resource.parseOptions(bundle);
        resource.parseSelect(bundle);
        resource.parseFormat(bundle);
        resource.parseFilters(bundle);
        resource.parsePopulate(bundle);
      })
      .add((bundle) => {
        return resource.getObject(bundle).then((object) => {
          if (!object) return bundle.next(new Restypie.TemplateErrors.ResourceNotFound({ pk }));
          return bundle
            .setData(object)
            .setStatusCode(Restypie.Codes.OK)
            .next();
        });
      })
      .add(resource.dehydrate)
      .add(resource.populate)
      .run();
  }
};
