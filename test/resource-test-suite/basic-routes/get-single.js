'use strict';

const Promise = require('bluebird');

module.exports = function (Fixtures) {

  describe('GET single', function () {

    it('should retrieve the user by id', function () {
      return Fixtures.generateUser().then((user) => {
        return Fixtures.getUser(user.theId);
      }).then((user) => {
        user.firstName.should.be.a('string');
        user.lastName.should.be.a('string');
        user.yearOfBirth.should.be.a('number');
        user.createdOn.should.be.a('string');
        user.hasSubscribedEmails.should.be.a('boolean');
        should.not.exist(user.password);
      });
    });

    it('should return only selected fields', function () {
      return Fixtures.generateUser().then((user) => {
        return Fixtures.getUser(user.theId, { select: ['theId', 'firstName'] });
      }).then((user) => {
        user.should.have.keys(['theId', 'firstName']);
      });
    });
    
    it('should populate job', function () {
      return Fixtures.generateUser().then((user) => {
        return Fixtures.getUser(user.theId, { populate: ['job'] }).then((populated) => {
          should.exist(populated.job);
          populated.job.should.be.an('object');
          populated.job.should.have.keys(['id', 'name']);
        });
      });
    });

    it('should populate users on jobs resource', function () {
      const usersCount = 2;

      return Fixtures.generateJob().then((job) => {
        return Fixtures.generateUsers(usersCount, { job: job.id }).then((users) => {
          return Fixtures.getJob(job.id, { populate: ['users'] }).then((populated) => {
            should.exist(populated.users);
            populated.users.should.be.an('array');
            populated.users.should.have.lengthOf(usersCount);
            users.forEach((user) => should.exist(populated.users.find((item) => item.theId === user.theId)));
          });
        });
      });
    });

    it('should populate slackTeams', function () {
      const userSlackTeamsCount = 2;

      return Fixtures.generateUser().then((user) => {
        return Promise.props({
          slackTeams: Fixtures.generateSlackTeams(2), // Generate 2 additional to check not all are returned
          userSlackTeams: Fixtures.generateUserSlackTeams(userSlackTeamsCount, { user: user.theId })
        }).then((results) => {
          return Fixtures.getUser(user.theId, { populate: ['slackTeams'] }).then((populated) => {
            should.exist(populated.slackTeams);
            populated.slackTeams.should.be.an('array');
            populated.slackTeams.should.have.lengthOf(userSlackTeamsCount);
            results.userSlackTeams.forEach((userSlackTeam) => {
              should.exist(populated.slackTeams.find((item) => item.id === userSlackTeam.slackTeam));
            });
          });
        });
      });
    });

    it('should populate slackTeams.channels', function () {
      const channelsCount = 4;

      return Promise.props({
        user: Fixtures.generateUser(),
        slackTeam: Fixtures.generateSlackTeam()
      }).then((results) => {
        return Promise.props({
          user: results.user,
          slackTeam: results.slackTeam,
          userSlackTeam: Fixtures.generateUserSlackTeam({
            user: results.user.theId,
            slackTeam: results.slackTeam.id
          }),
          channels: Fixtures.generateSlackTeamChannels(channelsCount, { slackTeam: results.slackTeam.id }),
          otherChannels: Fixtures.generateSlackTeamChannels(3) // To make sure not all are returned
        }).then((results) => {
          return Fixtures.getUser(results.user.theId, { populate: ['slackTeams.channels'] }).then((populated) => {
            should.exist(populated.slackTeams);
            populated.slackTeams.should.be.an('array');
            populated.slackTeams.should.have.lengthOf(1);
            const slackTeam = populated.slackTeams[0];
            should.exist(slackTeam.channels);
            slackTeam.channels.should.be.an('array');
            slackTeam.channels.should.have.lengthOf(channelsCount);
            results.channels.forEach((channel) => {
              should.exist(slackTeam.channels.find((item) => item.id === channel.id));
            });
          });
        });
      });



    //   let userId = 1;
    //   return supertest(app)
    //     .get('/v1/users/' + userId + '?' + QS.stringify({ populate: 'slackTeams.channels' }))
    //     .expect(Restypie.Codes.OK, function (err, res) {
    //       if (err) return done(err);
    //       let data = res.body.data;
    //       should.exist(data.slackTeams);
    //       data.slackTeams.should.be.an('array');
    //       return supertest(app)
    //         .get('/v1/user-slack-teams?' + QS.stringify({ user: userId, limit: 1 }))
    //         .end(function (err, res) {
    //           if (err) return done(err);
    //           data.slackTeams.length.should.equal(res.body.meta.total);
    //
    //           return async.each(data.slackTeams, function (team, cb) {
    //             let channels = team.channels;
    //             should.exist(channels);
    //             channels.should.be.an('array');
    //             return supertest(app)
    //               .get('/v1/slack-team-channels?' + QS.stringify({ slackTeam: team.id, limit: 1 }))
    //               .end(function (err, res) {
    //                 if (err) return cb(err);
    //                 channels.length.should.equal(res.body.meta.total);
    //                 return cb();
    //               });
    //           }, done);
    //         });
    //     });
    });
    
    // it('should populate slackTeams.channels.slackTeam', function (done) {
    //   let userId = 1;
    //   return supertest(app)
    //     .get('/v1/users/' + userId + '?' + QS.stringify({ populate: 'slackTeams.channels.slackTeam' }))
    //     .expect(Restypie.Codes.OK, function (err, res) {
    //       if (err) return done(err);
    //       let data = res.body.data;
    //       should.exist(data.slackTeams);
    //       data.slackTeams.should.be.an('array');
    //       return supertest(app)
    //         .get('/v1/user-slack-teams?' + QS.stringify({ user: userId, limit: 1 }))
    //         .end(function (err, res) {
    //           if (err) return done(err);
    //           data.slackTeams.length.should.equal(res.body.meta.total);
    //
    //           return async.each(data.slackTeams, function (team, cb) {
    //             let channels = team.channels;
    //             should.exist(channels);
    //             channels.should.be.an('array');
    //             return supertest(app)
    //               .get('/v1/slack-team-channels?' + QS.stringify({ slackTeam: team.id, limit: 1 }))
    //               .end(function (err, res) {
    //                 if (err) return cb(err);
    //                 channels.length.should.equal(res.body.meta.total);
    //                 channels.forEach(function (channel) {
    //                   should.exist(channel.slackTeam);
    //                   channel.slackTeam.should.be.an('object');
    //                   channel.slackTeam.id.should.equal(team.id);
    //                 });
    //                 return cb();
    //               });
    //           }, done);
    //         });
    //     });
    // });
    //
    // it('should populate users on slack-teams', function (done) {
    //   let teamId = 1;
    //   return supertest(app)
    //     .get('/v1/slack-teams/' + teamId + '?' + QS.stringify({ populate: 'users' }))
    //     .expect(Restypie.Codes.OK, function (err, res) {
    //       if (err) return done(err);
    //       let data = res.body.data;
    //       should.exist(data.users);
    //       data.users.should.be.an('array');
    //       return supertest(app)
    //         .get('/v1/user-slack-teams?' + QS.stringify({ slackTeam: teamId, limit: 1 }))
    //         .end(function (err, res) {
    //           if (err) return done(err);
    //           data.users.length.should.equal(res.body.meta.total);
    //           return done();
    //         });
    //     });
    // });
    //
    // it('should not populate a field that is not selected', function (done) {
    //   return supertest(app)
    //     .get('/v1/users')
    //     .expect(Restypie.Codes.OK, function (err, res) {
    //       if (err) return done(err);
    //       let user = res.body.data[0];
    //
    //       return supertest(app)
    //         .get('/v1/users/' + user.theId + '?' + QS.stringify({ populate: 'job', select: 'theId, firstName' }))
    //         .expect(Restypie.Codes.OK, function (err, res) {
    //           if (err) return done(err);
    //           let data = res.body.data;
    //           should.not.exist(data.job);
    //           data.should.have.keys(['theId', 'firstName']);
    //           return done();
    //         });
    //
    //     });
    // });
    //
    // it('should send back a 404', function (done) {
    //   let id = Date.now();
    //
    //   return supertest(app)
    //     .get('/v1/users/' + id)
    //     .expect(Restypie.Codes.NotFound, function (err, res) {
    //       if (err) return done(err);
    //       let data = res.body;
    //       data.error.should.equal(true);
    //       data.meta.should.should.be.an('object');
    //       data.meta.pk.should.equal(id);
    //       return done();
    //     });
    // });
    //
    // it('should not be able to parse the id', function (done) {
    //   let id = 'foo';
    //
    //   return supertest(app)
    //     .get('/v1/users/' + id)
    //     .expect(Restypie.Codes.BadRequest, function (err, res) {
    //       if (err) return done(err);
    //       let data = res.body;
    //       data.error.should.equal(true);
    //       data.meta.should.should.be.an('object');
    //       data.meta.key.should.equal('theId');
    //       data.meta.value.should.equal(id);
    //       return done();
    //     });
    // });

  });
};