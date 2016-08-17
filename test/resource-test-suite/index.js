'use strict';

// For external callers
global.should = require('chai').should();

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
const express = require('express');
const koa = require('koa');
const http = require('http');
const KoaRouter = require('koa-router');
const Restypie = require('../../');

const SERVER_PORT = 3333;


/***********************************************************************************************************************
 * Resource tests suite. Run your implementation against this test suite to verify that it supports the basics of the
 * features from Restypie.
 *
 * @param {Object} options
 * @param {constructor} options.resource A Restypie.Resources.AbstractResource subclass
 * @param {constructor} options.routerType Which router type to run the tests against
 * @param {Object} [options.port=3333] The port for the server
 **********************************************************************************************************************/
module.exports = function (options) {

  Restypie.Utils.isSubclassOf(options.resource, Restypie.Resources.AbstractResource, true);
  Restypie.assertSupportedRouterType(options.routerType);

  let supertest;
  let app;
  let server;
  let router;

  const api = options.api = new Restypie.API({ path: 'v1', routerType: options.routerType });

  const UsersResource = require('./resources/users')(options);
  const JobsResource = require('./resources/jobs')(options);
  const SlackTeamsResource = require('./resources/slack-teams')(options);
  const UserSlackTeamsResource = require('./resources/user-slack-teams')(options);
  const SlackTeamChannelsResource = require('./resources/slack-team-channels')(options);

  switch (options.routerType) {

    case Restypie.RouterTypes.EXPRESS:
      app = express();
      router = app;
      server = http.createServer(app);
      supertest = require('supertest');
      break;

    case Restypie.RouterTypes.KOA_ROUTER:
      app = koa();
      router = new KoaRouter();
      server = http.createServer(app.callback());
      supertest = require('supertest-koa-agent');
      break;

  }

  const Fixtures = require('./utils/fixtures')(supertest, app, api);

  api
    .registerResources({
      jobs: JobsResource,
      users: UsersResource,
      slackTeams: SlackTeamsResource,
      userSlackTeams: UserSlackTeamsResource,
      slackTeamChannels: SlackTeamChannelsResource
    })
    .launch(router, { port: SERVER_PORT });


  switch (options.routerType) {
    case Restypie.RouterTypes.KOA_ROUTER:
      app.use(router.routes());
      break;
  }

  before(function (done) {
    return server.listen(SERVER_PORT, done);
  });

  if (options.before) {
    before(function () {
      return options.before(arguments[0]);
    });
  }

  beforeEach(function () {
    return Fixtures.reset();
  });

  /****************************************
   * BEGIN tests
   ****************************************/

  require('./basic-routes/post')(Fixtures, api, supertest, app);
  require('./basic-routes/get-single')(Fixtures, api, supertest, app);
  require('./basic-routes/get-many')(Fixtures, api, supertest, app);
  require('./basic-routes/patch-single')(Fixtures, api, supertest, app);
  require('./basic-routes/patch-many')(Fixtures, api, supertest, app);
  require('./basic-routes/put')(Fixtures, api, supertest, app);
  require('./basic-routes/delete-single')(Fixtures, api, supertest, app);

  /****************************************
   * END tests
   ****************************************/

  after(function (done) {
    return server.close(done);
  });

};


