'use strict';

const Restypie = require('../../../');

module.exports = function (options) {

  const api = options.api;

  return class ProfilesResource extends Restypie.Resources.FixturesResource {
    get path() { return '/profiles'; }
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
        flag: { type: Boolean, isWritable: true, isFilterable: true, default: true, filteringWeight: 90 },
        userId: { type: 'int', isWritableOnce: true, isFilterable: true },
        user: {
          type: Restypie.Fields.ToOneField,
          to() { return api.resources.users; },
          isFilterable: true,
          fromKey: 'userId'
        }
      };
    }
  }
};
