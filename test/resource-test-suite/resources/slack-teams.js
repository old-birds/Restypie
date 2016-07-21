'use strict';

const Restypie = require('../../../');

module.exports = function (options) {

  const api = options.api;
  
  return class SlackTeamsResource extends Restypie.Resources.FixturesResource {
    get path() { return '/slack-teams'; }
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
          isReadable: true,
          through() { return api.resources.userSlackTeams; },
          throughKey: 'slackTeam',
          otherThroughKey: 'user'
        },
        channels: {
          type: Restypie.Fields.ToManyField,
          to() { return api.resources.slackTeamChannels; },
          toKey: 'slackTeam',
          isReadable: true
        }
      };
    }
  }
  
};  