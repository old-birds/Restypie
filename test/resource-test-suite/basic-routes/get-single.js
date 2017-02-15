'use strict';

const Promise = require('bluebird');

const Restypie = require('../../../');

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
        return Promise.props(Object.assign({
          userSlackTeam: Fixtures.generateUserSlackTeam({
            user: results.user.theId,
            slackTeam: results.slackTeam.id
          }),
          channels: Fixtures.generateSlackTeamChannels(channelsCount, { slackTeam: results.slackTeam.id }),
          otherChannels: Fixtures.generateSlackTeamChannels(3) // To make sure not all are returned
        }, results)).then((results) => {
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
    });

    it('should populate slackTeams.channels.slackTeam', function () {
      return Promise.props({
        user: Fixtures.generateUser(),
        slackTeams: Fixtures.generateSlackTeams(2)
      }).then((results) => {
        return Promise.props(Object.assign({
          userSlackTeams: Fixtures.generateUserSlackTeams(2, (index) => {
            return { user: results.user.theId, slackTeam: results.slackTeams[index].id };
          }),
          channels: Fixtures.generateSlackTeamChannels(4, (index) => {
            return { slackTeam: results.slackTeams[index < 2 ? 0 : 1].id };
          })
        }, results)).then((results) => {
          return Fixtures.getUser(results.user.theId, {
            populate: ['slackTeams.channels.slackTeam']
          }).then((populated) => {
            populated.slackTeams.should.be.an('array').and.have.lengthOf(2);
            populated.slackTeams.forEach((slackTeam) => {
              slackTeam.channels.should.be.an('array').and.have.lengthOf(2);
              slackTeam.channels.forEach((channel) => {
                channel.slackTeam.should.be.an('object');
                channel.slackTeam.id.should.equal(slackTeam.id);
              });
            });
          });
        });
      });
    });

    it('should populate profile', function () {
      return Fixtures.generateProfile().then(profile => {
        return Fixtures.getUser(profile.userId, {
          populate: ['profile']
        });
      }).then(user => {
        user.profile.should.be.an('object');
        user.profile.flag.should.equal(true);
      });
    });

    it('should populate users on slack-teams', function () {
      const usersCount = 4;

      return Promise.props({
        slackTeam: Fixtures.generateSlackTeam(),
        users: Fixtures.generateUsers(usersCount)
      }).then((results) => {
        return Promise.props(Object.assign({
          userSlackTeams: Fixtures.generateUserSlackTeams(usersCount, (index) => {
            return { user: results.users[index].theId, slackTeam: results.slackTeam.id };
          })
        }, results)).then((results) => {
          return Fixtures.getSlackTeam(results.slackTeam.id, { populate: ['users'] }).then((slackTeam) => {
            should.exist(slackTeam.users);
            slackTeam.users.should.be.an('array').and.have.lengthOf(usersCount);
          });
        });
      });
    });

    it('should not populate a field that is not selected', function () {
      return Fixtures.generateUser().then((user) => {
        return Fixtures.getUser(user.theId, { populate: ['job'], select: ['theId', 'firstName'] }).then((populated) => {
          should.not.exist(populated.job);
          populated.should.have.keys(['theId', 'firstName']);
        });
      });
    });

    it('should send back a 404', function () {
      return Fixtures.getUser(1, { statusCode: Restypie.Codes.NotFound });
    });

    it('should NOT be able to parse the id', function () {
      const wrongId = 'foo';
      return Fixtures.getUser(wrongId, { statusCode: Restypie.Codes.BadRequest }).then((body) => {
        body.error.should.equal(true);
        body.meta.should.should.be.an('object');
        body.meta.key.should.equal('theId');
        body.meta.value.should.equal(wrongId);
      });
    });

  });
};
