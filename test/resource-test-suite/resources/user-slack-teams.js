'use strict';

const Restypie = require('../../../');

module.exports = function () {
  
  return class UserSlackTeamsResource extends Restypie.Resources.FixturesResource {
    get path() { return '/user-slack-teams'; }
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
        // TODO this should be a virtual property as lookup tables do not necessarily have a single primaryKey
        id: { type: 'int', isPrimaryKey: true },
  
        user: { type: 'int', isFilterable: true, isWritable: true },
        slackTeam: { type: 'int', isFilterable: true, isWritable: true }
      };
    }
  }
  
};