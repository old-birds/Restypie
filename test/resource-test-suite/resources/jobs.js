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
        name: { type: String, isWritable: true, isFilterable: true, filteringWeight: 100 },
        users: {
          type: Restypie.Fields.ToManyField,
          to() { return api.resources.users; },
          isFilterable: true,
          toKey: 'job'
        },
        dynamicRelation: {
          type: Restypie.Fields.ToOneField,
          to: (object) => {
            switch (object.name) {
              case 'developer': return api.resources.users;
              case 'other': return api.resources.slackTeams;
              default: throw new Restypie.RestErrors.BadRequest(`Can't find resource for name ${object.name}`);
            }
          },
          fromKey: 'id',
          isFilterable: true
        }
      };
    }
  }
};