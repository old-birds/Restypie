'use strict';

const Restypie = require('../../../');

module.exports = function (options) {

  const api = options.api;
  
  return class SlackTeamChannelsResource extends Restypie.Resources.FixturesResource {
    get path() { return '/slack-team-channels'; }
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
        name: { type: String, isWritable: true, isReadable: true },
        slackTeam: {
          type: 'int',
          to() { return api.resources.slackTeams; },
          isWritable: true,
          isFilterable: true
        }
      };
    }
  }
  
};