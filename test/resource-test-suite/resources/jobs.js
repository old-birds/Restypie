'use strict';

const Restypie = require('../../../');

module.exports = function (options) {
  
  const api = options.api;
  
  return class JobsResource extends Restypie.Resources.FixturesResource {
    get path() { return '/jobs'; }
    get routes() {
      return [
        Restypie.BasicRoutes.PostRoute,
        Restypie.BasicRoutes.GetSingleRoute,
        Restypie.BasicRoutes.GetManyRoute,
        Restypie.BasicRoutes.PatchSingleRoute,
        Restypie.BasicRoutes.DeleteSingleRoute
      ];
    }
    get schema() {
      return {
        id: { type: 'int', isPrimaryKey: true },
        name: { type: String, isWritable: true, isFilterable: true },
        users: {
          type: Restypie.Fields.ToManyField,
          to() { return api.resources.users; },
          isFilterable: true,
          toKey: 'job'
        }
      };
    }
  }
};