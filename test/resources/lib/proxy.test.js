'use strict';


let express = require('express');
let http = require('http');
let bodyParser = require('body-parser');
let supertest = require('supertest');
let _ = require('lodash');
let QS = require('querystring');
let async = require('async');

// Create the express app
let app = express();
app.set('port', 8888);
let server = http.createServer(app);
app.use(bodyParser.json());


// Create the remote express app
let remoteApp = express();
remoteApp.set('port', 8889);
let remoteServer = http.createServer(remoteApp);
remoteApp.use(bodyParser.json());

let api = new Restypie.API({ path: '/v1' });
let remoteApi = new Restypie.API({ path: '/v2' });


class RemoteJobsResource extends Restypie.Resources.ProxyResource {
  get targetUrl() { return 'http://localhost:8889/v2/jobs'; }
  get schema() {
    return {
      id: { type: 'int', isPrimaryKey: true }
    };
  }
}

class RemoteUsersResource extends Restypie.Resources.ProxyResource {
  get targetUrl() { return 'http://localhost:8888/v1/users'; }
  get schema() {
    return {
      theId: { type: 'int', isPrimaryKey: true },
      job: { type: 'int' }
    };
  }
}

class RemoteUserSlackTeamsResource extends Restypie.Resources.ProxyResource {
  get targetUrl() { return 'http://localhost:8889/v2/user-slack-teams'; }
  get schema() {
    return {
      id: { type: 'int', isPrimaryKey: true },
      user: { type: 'int' },
      slackTeam: { type: 'int' }
    };
  }
}

class RemoteSlackTeamsResource extends Restypie.Resources.ProxyResource {
  get targetUrl() { return 'http://localhost:8888/v1/slack-teams'; }
  get schema() {
    return {
      id: { type: 'int', isPrimaryKey: true }
    };
  }
}

class RemoteSlackTeamChannelsResource extends Restypie.Resources.ProxyResource {
  get targetUrl() { return 'http://localhost:8889/v2/slack-team-channels'; }
  get schema() {
    return {
      id: { type: 'int', isPrimaryKey: true },
      slackTeam: { type: 'int' }
    };
  }
}


class JobsResource extends Restypie.Resources.FixturesResource {
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
      name: { type: String, isWritable: true, isReadable: true },
      users: {
        type: Restypie.Fields.ToManyField,
        to: new RemoteUsersResource(),
        isReadable: true,
        toKey: 'job'
      }
    };
  }
}

class UserSlackTeamsResource extends Restypie.Resources.FixturesResource {
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
      id: { type: 'int', isPrimaryKey: true },
      user: { type: 'int', isFilterable: true, isWritable: true },
      slackTeam: { type: 'int', isFilterable: true, isWritable: true }
    };
  }
}


class SlackTeamsResource extends Restypie.Resources.FixturesResource {
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
      name: { type: String, isWritable: true, isReadable: true },
      users: {
        type: Restypie.Fields.ToManyField,
        to() { return api.resources.Users; },
        isReadable: true,
        through: new RemoteUserSlackTeamsResource(),
        throughKey: 'slackTeam',
        otherThroughKey: 'user'
      },
      channels: {
        type: Restypie.Fields.ToManyField,
        to: new RemoteSlackTeamChannelsResource(),
        toKey: 'slackTeam',
        isReadable: true
      }
    };
  }
}


class SlackTeamChannelsResource extends Restypie.Resources.FixturesResource {
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
        to: new RemoteSlackTeamsResource(),
        isWritable: true,
        isFilterable: true
      }
    };
  }
}


class UsersResource extends Restypie.Resources.FixturesResource {
  get path() { return '/users'; }
  get maxLimit() { return 50; }
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
      theId: { type: 'int', isPrimaryKey: true, isWritable: true },
      name: { type: String, isWritable: true, isReadable: true },
      job: {
        type: 'int',
        isFilterable: true,
        isWritable: true,
        to: new RemoteJobsResource()
      },
      slackTeams: {
        type: Restypie.Fields.ToManyField,
        to() { return api.resources.SlackTeams; },
        isReadable: true,
        through: new RemoteUserSlackTeamsResource(),
        throughKey: 'user',
        otherThroughKey: 'slackTeam'
      }
    };
  }
}

remoteApi
  .registerResource('Jobs', JobsResource)
  .registerResource('UserSlackTeams', UserSlackTeamsResource)
  .registerResource('SlackTeamChannels', SlackTeamChannelsResource)
  .launch(remoteApp, { port: remoteApp.get('port') });

api
  .registerResource('Users', UsersResource)
  .registerResource('SlackTeams', SlackTeamsResource)
  .launch(app, { port: app.get('port') });


describe('Resources.ProxyResource', function () {

  before(function (done) {
    return remoteServer.listen(remoteApp.get('port'), done);
  });

  before(function (done) {
    return server.listen(app.get('port'), done);
  });

  // Populate jobs
  before(function () {
    return Promise.all([{ name: 'Developer' }, { name: 'Waiter' }].map(function (item) {
      return new Promise(function (resolve, reject) {
        return supertest(remoteApp)
          .post('/v2/jobs')
          .send(item)
          .expect(Restypie.Codes.Created, function (err) {
            if (err) return reject(err);
            return resolve();
          });
      });
    }));
  });

  // Populate users
  before(function () {
    return Promise.all([{ name: 'John Doe', job: 1 }, { name: 'Jane Doe', job: 2 }].map(function (item) {
      return new Promise(function (resolve, reject) {
        return supertest(app)
          .post('/v1/users')
          .send(item)
          .expect(Restypie.Codes.Created, function (err) {
            if (err) return reject(err);
            return resolve();
          });
      });
    }));
  });

  // Populate slack teams
  before(function () {
    let teams = [];
    _.times(10, (n) => teams.push({ name: 'Team' + n }));
    return Promise.all(teams.map(function (item) {
      return new Promise(function (resolve, reject) {
        return supertest(app)
          .post('/v1/slack-teams')
          .send(item)
          .expect(Restypie.Codes.Created, function (err) {
            if (err) return reject(err);
            return resolve();
          });
      });
    }));
  });

  // Populate slack channels
  before(function () {
    let channels = [];
    _.times(5, (n) => channels.push({ name: 'Channel' + n, slackTeam: 1 }));
    return Promise.all(channels.map(function (item) {
      return new Promise(function (resolve, reject) {
        return supertest(remoteApp)
          .post('/v2/slack-team-channels')
          .send(item)
          .expect(Restypie.Codes.Created, function (err) {
            if (err) return reject(err);
            return resolve();
          });
      });
    }));
  });

  // Populate slack teams members
  before(function () {
    let teamsPerUser = [{
      user: 1,
      teams: [1, 2, 3]
    }, {
      user: 2,
      teams: [4, 5, 6, 7, 8, 9, 10]
    }];

    return Promise.all(teamsPerUser.map(function (group) {
      return Promise.all(group.teams.map(function (slackTeam) {
        return new Promise(function (resolve, reject) {
          return supertest(remoteApp)
            .post('/v2/user-slack-teams')
            .send({ user: group.user, slackTeam })
            .expect(Restypie.Codes.Created, function (err) {
              if (err) return reject(err);
              return resolve();
            });
        });
      }));
    }));
  });



  it('should populate foreign key', function (done) {
    return supertest(app)
      .get('/v1/users?' + QS.stringify({ populate: 'job' }))
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        let data = res.body.data;
        data.should.be.an('array');
        data.forEach(function (object) {
          object.job.should.be.an('object');
          object.job.should.have.keys(['id', 'name']);
        });
        return done();
      });
  });

  it('should populate users on jobs resource', function (done) {
    return supertest(remoteApp)
      .get('/v2/jobs' + '?' + QS.stringify({ populate: 'users' }))
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        let data = res.body.data;
        data.should.be.an('array');
        return async.each(data, function (item, cb) {
          should.exist(item.users);
          item.users.should.be.an('array');
          return supertest(app)
            .get('/v1/users?' + QS.stringify({ job: item.id, limit: 1 }))
            .end(function (err, res) {
              if (err) return cb(err);
              item.users.length.should.equal(res.body.meta.total);
              return cb();
            });
        }, done);
      });
  });

  it('should populate slackTeams', function (done) {
    return supertest(app)
      .get('/v1/users?' + QS.stringify({ populate: 'slackTeams' }))
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        let data = res.body.data;
        data.should.be.an('array');
        return async.each(data, function (item, cb) {
          should.exist(item.slackTeams);
          item.slackTeams.should.be.an('array');
          return supertest(remoteApp)
            .get('/v2/user-slack-teams?' + QS.stringify({ user: item.theId, limit: 1 }))
            .expect(Restypie.Codes.OK, function (err, res) {
              if (err) return cb(err);
              item.slackTeams.length.should.equal(res.body.meta.total);
              return cb();
            });
        }, done);
      });
  });

  it('should populate slackTeams.channels', function (done) {
    return supertest(app)
      .get('/v1/users?' + QS.stringify({ populate: 'slackTeams.channels' }))
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        let data = res.body.data;
        data.should.be.an('array');

        return async.forEach(data, function (item, onItem) {
          should.exist(item.slackTeams);
          item.slackTeams.should.be.an('array');

          return supertest(remoteApp)
            .get('/v2/user-slack-teams?' + QS.stringify({ user: item.theId, limit: 1 }))
            .expect(Restypie.Codes.OK, function (err, res) {
              if (err) return onItem(err);

              item.slackTeams.length.should.equal(res.body.meta.total);

              return async.each(item.slackTeams, function (team, cb) {
                let channels = team.channels;
                should.exist(channels);
                channels.should.be.an('array');
                return supertest(remoteApp)
                  .get('/v2/slack-team-channels?' + QS.stringify({ slackTeam: team.id, limit: 1 }))
                  .expect(Restypie.Codes.OK, function (err, res) {
                    if (err) return cb(err);
                    channels.length.should.equal(res.body.meta.total);
                    return cb();
                  });
              }, onItem);
            });
        }, done);
      });
  });

  it('should populate users on slack-teams', function (done) {
    return supertest(app)
      .get('/v1/slack-teams?' + QS.stringify({ populate: 'users' }))
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        let data = res.body.data;
        data.should.be.an('array');
        return async.each(data, function (item, cb) {
          should.exist(item.users);
          item.users.should.be.an('array');
          return supertest(remoteApp)
            .get('/v2/user-slack-teams?' + QS.stringify({ slackTeam: item.id, limit: 1 }))
            .expect(Restypie.Codes.OK, function (err, res) {
              if (err) return cb(err);
              item.users.length.should.equal(res.body.meta.total);
              return cb();
            });
        }, done);
      });
  });


  after(function (done) {
    return server.close(done);
  });


  after(function (done) {
    return remoteServer.close(done);
  });
});