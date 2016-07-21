'use strict';

module.exports = function (supertest, app, fixtures) {
  describe('GET single', function () {

    it('Preparing tests...', function (done) {
      // TODO create user using fixtures in each test
      return resetAndFillUsers(1, done);
    });

    it('should retrieve the user by id', function (done) {
      return supertest(app)
        .get('/v1/users')
        .expect(Restypie.Codes.OK, function (err, res) {
          if (err) return done(err);
          let user = res.body.data[0];

          return supertest(app)
            .get('/v1/users/' + user.theId)
            .expect(Restypie.Codes.OK, function (err, res) {
              if (err) return done(err);
              let data = res.body.data;
              should.exist(data);
              data.firstName.should.be.a('string');
              data.lastName.should.be.a('string');
              data.yearOfBirth.should.be.a('number');
              data.createdOn.should.be.a('string');
              data.hasSubscribedEmails.should.be.a('boolean');
              should.not.exist(data.password);
              return done();
            });

        });
    });

    it('should return only selected fields', function (done) {
      return supertest(app)
        .get('/v1/users')
        .expect(Restypie.Codes.OK, function (err, res) {
          if (err) return done(err);
          let user = res.body.data[0];

          return supertest(app)
            .get('/v1/users/' + user.theId + '?' + QS.stringify({ select: 'theId,firstName' }))
            .expect(Restypie.Codes.OK, function (err, res) {
              if (err) return done(err);
              let data = res.body.data;
              should.exist(data);
              data.should.have.keys(['theId', 'firstName']);
              return done();
            });

        });
    });

    it('should populate foreign key', function (done) {
      return supertest(app)
        .get('/v1/users')
        .expect(Restypie.Codes.OK, function (err, res) {
          if (err) return done(err);
          let user = res.body.data[0];

          return supertest(app)
            .get('/v1/users/' + user.theId + '?' + QS.stringify({ populate: 'job' }))
            .expect(Restypie.Codes.OK, function (err, res) {
              if (err) return done(err);
              let data = res.body.data;
              should.exist(data.job);
              data.job.should.be.an('object');
              data.job.should.have.keys(['id', 'name']);
              return done();
            });

        });
    });

    it('should populate users on jobs resource', function (done) {
      let jobId = 1;
      return supertest(app)
        .get('/v1/jobs/' + jobId + '?' + QS.stringify({ populate: 'users' }))
        .expect(Restypie.Codes.OK, function (err, res) {
          if (err) return done(err);
          let data = res.body.data;
          should.exist(data.users);
          data.users.should.be.an('array');
          return supertest(app)
            .get('/v1/users?' + QS.stringify({ job: jobId, limit: 1 }))
            .end(function (err, res) {
              if (err) return done(err);
              data.users.length.should.equal(res.body.meta.total);
              return done();
            });
        });
    });

    it('should populate slackTeams', function (done) {
      let userId = 1;
      return supertest(app)
        .get('/v1/users/' + userId + '?' + QS.stringify({ populate: 'slackTeams' }))
        .expect(Restypie.Codes.OK, function (err, res) {
          if (err) return done(err);
          let data = res.body.data;
          should.exist(data.slackTeams);
          data.slackTeams.should.be.an('array');
          return supertest(app)
            .get('/v1/user-slack-teams?' + QS.stringify({ user: userId, limit: 1 }))
            .end(function (err, res) {
              if (err) return done(err);
              data.slackTeams.length.should.equal(res.body.meta.total);
              return done();
            });
        });
    });

    it('should populate slackTeams.channels', function (done) {
      let userId = 1;
      return supertest(app)
        .get('/v1/users/' + userId + '?' + QS.stringify({ populate: 'slackTeams.channels' }))
        .expect(Restypie.Codes.OK, function (err, res) {
          if (err) return done(err);
          let data = res.body.data;
          should.exist(data.slackTeams);
          data.slackTeams.should.be.an('array');
          return supertest(app)
            .get('/v1/user-slack-teams?' + QS.stringify({ user: userId, limit: 1 }))
            .end(function (err, res) {
              if (err) return done(err);
              data.slackTeams.length.should.equal(res.body.meta.total);

              return async.each(data.slackTeams, function (team, cb) {
                let channels = team.channels;
                should.exist(channels);
                channels.should.be.an('array');
                return supertest(app)
                  .get('/v1/slack-team-channels?' + QS.stringify({ slackTeam: team.id, limit: 1 }))
                  .end(function (err, res) {
                    if (err) return cb(err);
                    channels.length.should.equal(res.body.meta.total);
                    return cb();
                  });
              }, done);
            });
        });
    });

    it('should populate slackTeams.channels.slackTeam', function (done) {
      let userId = 1;
      return supertest(app)
        .get('/v1/users/' + userId + '?' + QS.stringify({ populate: 'slackTeams.channels.slackTeam' }))
        .expect(Restypie.Codes.OK, function (err, res) {
          if (err) return done(err);
          let data = res.body.data;
          should.exist(data.slackTeams);
          data.slackTeams.should.be.an('array');
          return supertest(app)
            .get('/v1/user-slack-teams?' + QS.stringify({ user: userId, limit: 1 }))
            .end(function (err, res) {
              if (err) return done(err);
              data.slackTeams.length.should.equal(res.body.meta.total);

              return async.each(data.slackTeams, function (team, cb) {
                let channels = team.channels;
                should.exist(channels);
                channels.should.be.an('array');
                return supertest(app)
                  .get('/v1/slack-team-channels?' + QS.stringify({ slackTeam: team.id, limit: 1 }))
                  .end(function (err, res) {
                    if (err) return cb(err);
                    channels.length.should.equal(res.body.meta.total);
                    channels.forEach(function (channel) {
                      should.exist(channel.slackTeam);
                      channel.slackTeam.should.be.an('object');
                      channel.slackTeam.id.should.equal(team.id);
                    });
                    return cb();
                  });
              }, done);
            });
        });
    });

    it('should populate users on slack-teams', function (done) {
      let teamId = 1;
      return supertest(app)
        .get('/v1/slack-teams/' + teamId + '?' + QS.stringify({ populate: 'users' }))
        .expect(Restypie.Codes.OK, function (err, res) {
          if (err) return done(err);
          let data = res.body.data;
          should.exist(data.users);
          data.users.should.be.an('array');
          return supertest(app)
            .get('/v1/user-slack-teams?' + QS.stringify({ slackTeam: teamId, limit: 1 }))
            .end(function (err, res) {
              if (err) return done(err);
              data.users.length.should.equal(res.body.meta.total);
              return done();
            });
        });
    });

    it('should not populate a field that is not selected', function (done) {
      return supertest(app)
        .get('/v1/users')
        .expect(Restypie.Codes.OK, function (err, res) {
          if (err) return done(err);
          let user = res.body.data[0];

          return supertest(app)
            .get('/v1/users/' + user.theId + '?' + QS.stringify({ populate: 'job', select: 'theId, firstName' }))
            .expect(Restypie.Codes.OK, function (err, res) {
              if (err) return done(err);
              let data = res.body.data;
              should.not.exist(data.job);
              data.should.have.keys(['theId', 'firstName']);
              return done();
            });

        });
    });

    it('should send back a 404', function (done) {
      let id = Date.now();

      return supertest(app)
        .get('/v1/users/' + id)
        .expect(Restypie.Codes.NotFound, function (err, res) {
          if (err) return done(err);
          let data = res.body;
          data.error.should.equal(true);
          data.meta.should.should.be.an('object');
          data.meta.pk.should.equal(id);
          return done();
        });
    });

    it('should not be able to parse the id', function (done) {
      let id = 'foo';

      return supertest(app)
        .get('/v1/users/' + id)
        .expect(Restypie.Codes.BadRequest, function (err, res) {
          if (err) return done(err);
          let data = res.body;
          data.error.should.equal(true);
          data.meta.should.should.be.an('object');
          data.meta.key.should.equal('theId');
          data.meta.value.should.equal(id);
          return done();
        });
    });

  });
};