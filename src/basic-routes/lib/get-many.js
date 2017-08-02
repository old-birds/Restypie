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
    const resource = this.context.resource;
    const pipeline = bundle.createPipeline(resource.exit, resource);

    return pipeline
      .add((bundle) => {
        resource.parseOptions(bundle);
        resource.parseLimit(bundle);
        resource.parseSelect(bundle);
        resource.parseOffset(bundle);
        resource.parseFormat(bundle);
        resource.parseFilters(bundle);
        resource.parsePopulate(bundle);
        resource.parseSort(bundle);
      })
      .add((bundle) => {
        const includeScore = bundle.hasOption(Restypie.QueryOptions.INCLUDE_SCORE);
        const scoreOnly = bundle.hasOption(Restypie.QueryOptions.SCORE_ONLY);

        if (!bundle.shouldCalculateQueryScore) return bundle.next();

        return resource.getQueryScore(bundle).then((score) => {

          if (includeScore || scoreOnly) bundle.assignToMeta({ score });

          if (scoreOnly) {
            bundle.setStatusCode(Restypie.Codes.OK);
            return pipeline.stop();
          }

          if (bundle.shouldValidateQueryScore) {
            return resource.validateQueryScore(score).then((isValid) => {
              if (!isValid) {
                bundle.assignToMeta({ score });
                return Promise.reject(new Restypie.TemplateErrors.RequestOutOfRange());
              }
            });
          }

        });
      })
      .add(resource.applyNestedFilters)
      .add((bundle) => {
        return resource.getObjects(bundle).then((objects) => {
          if (!Array.isArray(objects)) return Promise.reject(new Error('getObjects should return an array'));
          return bundle.setData(objects).setStatusCode(Restypie.Codes.OK);
        });
      })
      .add(resource.populate)
      .add(resource.dehydrate)
      .add((bundle) => {
        bundle.assignToMeta({ limit: bundle.limit, offset: bundle.offset });

        if (!bundle.hasOption(resource.options.NO_COUNT)) {
          return resource.countObjects(bundle).then(function (total) {
            return bundle.assignToMeta({ total }).assignToMeta(bundle.getNavLinks(total));
          });
        }
      })
      .run();
  }

};
