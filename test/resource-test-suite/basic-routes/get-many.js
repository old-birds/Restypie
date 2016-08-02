'use strict';

const Promise = require('bluebird');

module.exports = function (Fixtures, api) {

  describe('GET many', function () {

    it('should retrieve `defaultLimit` users', function () {
      const defaultLimit = api.resources.users.defaultLimit;
      const totalUsers = defaultLimit * 2;

      return Fixtures.generateUsers(totalUsers).then(() => {
        return Fixtures.getUsers(null, { return: Fixtures.ReturnTypes.BODY }).then((body) => {
          body.data.length.should.equal(defaultLimit);
          body.meta.total.should.equal(totalUsers);
          body.meta.limit.should.equal(defaultLimit);
        });
      });
    });

    it('should populate job', function () {
      const usersCount = 10;

      return Fixtures.generateUsers(usersCount).then(() => {
        return Fixtures.getUsers(null, { populate: ['job'] }).then((populated) => {
          populated.should.be.an('array').and.have.lengthOf(usersCount);
          populated.forEach((user) => {
            user.job.should.be.an('object');
            should.exist(user.job.id);
          });
        });
      });
    });
  
    it('should populate users on jobs resource', function () {
      const usersCount = 5;
      const jobsCount = 2;
      
      return Fixtures.generateJobs(jobsCount).then((jobs) => {
        return Promise.all(jobs.map((job) => {
          return Fixtures.generateUsers(usersCount, { job: job.id });
        }));
      }).then(() => {
        return Fixtures.getJobs(null, { populate: ['users'] }).then((jobs) => {
          jobs.should.be.an('array').and.have.lengthOf(jobsCount);
          jobs.forEach((job) => {
            job.users.should.be.an('array').and.have.lengthOf(usersCount);
          });
        });
      });
    });
  
    it('should populate otherJobPopulation', function () {
      const usersCount = 2;

      return Fixtures.generateUsers(usersCount).then(() => {
        return Fixtures.getUsers(null, { populate: ['job', 'otherJobPopulation'] }).then((users) => {
          users.should.be.an('array').and.have.lengthOf(usersCount);
          users.forEach((user) => {
            user.otherJobPopulation.should.deep.equal(user.job);
          });
        });
      });
    });

    it('should populate slackTeams', function () {
      const usersCount = 2;
      const slackTeamsCount = 4;

      return Promise.props({
        users: Fixtures.generateUsers(usersCount),
        slackTeams: Fixtures.generateSlackTeams(slackTeamsCount)
      }).then((results) => {
        return Fixtures.generateUserSlackTeams(slackTeamsCount, (index) => {
          return {
            user: results.users[index < slackTeamsCount / 2 ? 0 : 1].theId,
            slackTeam: results.slackTeams[index].id
          };
        })
      }).then(() => {
        return Fixtures.getUsers(null, { populate: ['slackTeams'] }).then((users) => {
          users.forEach((user) => {
            user.slackTeams.should.be.an('array').and.have.lengthOf(slackTeamsCount / 2);
          });
        });
      });
    });

    it('should populate slackTeams.channels', function () {
      const usersCount = 2;
      const slackTeamsCount = 4;
      const channelsCount = 8;

      return Promise.props({
        users: Fixtures.generateUsers(usersCount),
        slackTeams: Fixtures.generateSlackTeams(slackTeamsCount)
      }).then((results) => {
        return Promise.props(Object.assign({
          userSlackTeams: Fixtures.generateUserSlackTeams(slackTeamsCount, (index) => {
            return {
              user: results.users[index < slackTeamsCount / 2 ? 0 : 1].theId,
              slackTeam: results.slackTeams[index].id
            };
          }),
          channels: Fixtures.generateSlackTeamChannels(channelsCount, (index) => {
            return { slackTeam: results.slackTeams[Math.floor(index / 2)].id };
          })
        }, results));
      }).then(() => {
        return Fixtures.getUsers(null, { populate: ['slackTeams.channels'] }).then((users) => {
          users.forEach((user) => {
            user.slackTeams.should.be.an('array').and.have.lengthOf(2);
            user.slackTeams.forEach((slackTeam) => {
              slackTeam.channels.should.be.an('array').and.have.lengthOf(2);
            });
          });
        });
      });
    });

    it('should populate users on slack-teams', function () {
      const usersCount = 2;
      const slackTeamsCount = 2;

      return Promise.props({
        users: Fixtures.generateUsers(usersCount),
        slackTeams: Fixtures.generateSlackTeams(slackTeamsCount)
      }).then((results) => {
        return Fixtures.generateUserSlackTeams(usersCount * slackTeamsCount, (index) => {
          return {
            user: results.users[Math.floor(index / 2)].id,
            slackTeam: results.slackTeams[Math.floor(index / 2)].id
          };
        });
      }).then(() => {
        return Fixtures.getSlackTeams(null, { populate: ['users'] }).then((slackTeams) => {
          slackTeams.should.be.an('array').and.have.lengthOf(slackTeamsCount);
          slackTeams.forEach((slackTeam) => {
            slackTeam.users.should.be.an('array').and.have.lengthOf(usersCount);
          });
        });
      });
    });

    it('should retrieve users based on `limit`', function () {
      const limit = 5;
      return Fixtures.generateUsers(10).then(() => {
        return Fixtures.getUsers(null, { limit }).then((users) => {
          users.should.be.an('array').and.have.lengthOf(limit);
        });
      });
    });

    it('should retrieve users based on `limit` (higher than the objects count)', function () {
      const limit = 15;
      const usersCount = 5;

      return Fixtures.generateUsers(usersCount).then(() => {
        return Fixtures.getUsers(null, { limit, return: Fixtures.ReturnTypes.BODY }).then((body) => {
          body.data.should.have.lengthOf(usersCount);
          body.meta.total.should.equal(usersCount);
          body.meta.limit.should.equal(limit);
        });
      });
    });

    it('should reject the request (limit exceeds `resource.maxLimit`)', function () {
      return Fixtures.getUsers(null, {
        limit: api.resources.users.maxLimit + 1,
        statusCode: Restypie.Codes.Forbidden
      }).then((body) => {
        body.error.should.equal(true);
        body.meta.should.be.an('object');
        body.meta.key.should.equal('limit');
      });
    });

    it('should reject the request (limit is not an integer)', function () {
      return Fixtures.getUsers(null, {
        limit: 'foo',
        statusCode: Restypie.Codes.BadRequest
      }).then((body) => {
        body.error.should.equal(true);
        body.meta.should.be.an('object');
        body.meta.key.should.equal('limit');
      });
    });

    it('should reject the request (limit is not positive)', function () {
      return Fixtures.getUsers(null, {
        limit: -1,
        statusCode: Restypie.Codes.Forbidden
      }).then((body) => {
        body.error.should.equal(true);
        body.meta.should.be.an('object');
        body.meta.key.should.equal('limit');
      });
    });

    it('should skip 5 users', function () {
      const limit = 10;
      const offset = 5;
      const usersCount = 25;

      return Fixtures.generateUsers(usersCount).then(() => {
        return Promise.props({
          all: Fixtures.getUsers(null, { limit: limit + offset }),
          part: Fixtures.getUsers(null, { limit, offset, return: Fixtures.ReturnTypes.BODY })
        }).then((results) => {
          results.part.data.should.have.lengthOf(limit);
          results.part.meta.total.should.equal(usersCount);
          results.part.meta.limit.should.equal(limit);
          results.part.meta.offset.should.equal(offset);
          results.part.data.should.deep.equal(results.all.slice(offset, limit + offset));
        });
      });
    });

    it('should retrieve no user (offset is too high)', function () {
      const usersCount = 30;
      const offset = 40;

      return Fixtures.generateUsers(usersCount).then(() => {
        return Fixtures.getUsers(null, { offset }).then((users) => {
          users.should.have.lengthOf(0);
        });
      });
    });

    it('should reject the request (offset is not an integer)', function () {
      return Fixtures.getUsers(null, { offset: 'foo', statusCode: Restypie.Codes.BadRequest }).then((body) => {
        body.error.should.equal(true);
        body.meta.should.be.an('object');
        body.meta.key.should.equal('offset');
      });
    });

    it('should reject the request (offset is not positive)', function () {
      return Fixtures.getUsers(null, { offset: -1, statusCode: Restypie.Codes.Forbidden }).then((body) => {
        body.error.should.equal(true);
        body.meta.should.be.an('object');
        body.meta.key.should.equal('offset');
      });
    });

    it('should correctly filter results with =', function () {
      const usersCount = 10;

      return Fixtures.generateUsers(usersCount, (index) => {
        return { hasSubscribedEmails: index < usersCount / 2 };
      }).then(() => {
        return Fixtures.getUsers({ hasSubscribedEmails: true }).then((users) => {
          users.should.have.lengthOf(usersCount / 2);
          users.forEach((user) => {
            user.hasSubscribedEmails.should.equal(true);
          });
        });
      });
    });

    it('should correctly filter results with __eq', function () {
      const usersCount = 10;

      return Fixtures.generateUsers(usersCount, (index) => {
        return { hasSubscribedEmails: index < usersCount / 2 };
      }).then(() => {
        return Fixtures.getUsers({ hasSubscribedEmails: { eq: true } }).then((users) => {
          users.should.have.lengthOf(usersCount / 2);
          users.forEach((user) => {
            user.hasSubscribedEmails.should.equal(true);
          });
        });
      });
    });

    it('should correctly filter results with __ne', function () {
      const usersCount = 10;

      return Fixtures.generateUsers(usersCount, (index) => {
        return { hasSubscribedEmails: index < usersCount / 2 };
      }).then(() => {
        return Fixtures.getUsers({ hasSubscribedEmails: { ne: false } }).then((users) => {
          users.should.have.lengthOf(usersCount / 2);
          users.forEach((user) => {
            user.hasSubscribedEmails.should.equal(true);
          });
        });
      });
    });

    it('should correctly filter results with __lt', function () {
      const usersCount = 10;

      return Fixtures.generateUsers(usersCount, (index) => {
        return { yearOfBirth: index < usersCount / 2 ? 1986 : 2000 };
      }).then(() => {
        return Fixtures.getUsers({ yearOfBirth: { lt: 2000 } }).then((users) => {
          users.should.have.lengthOf(usersCount / 2);
          users.forEach((user) => {
            user.yearOfBirth.should.be.below(2000);
          });
        });
      });
    });

    it('should correctly filter results with __lte', function () {
      const usersCount = 10;

      return Fixtures.generateUsers(usersCount, (index) => {
        return { yearOfBirth: index < usersCount / 2 ? 1986 : 2000 };
      }).then(() => {
        return Fixtures.getUsers({ yearOfBirth: { lte: 2000 } }).then((users) => {
          users.should.have.lengthOf(usersCount);
          users.forEach((user) => {
            user.yearOfBirth.should.be.at.most(2000);
          });
        });
      });
    });

    it('should correctly filter results with __gt', function () {
      const usersCount = 10;

      return Fixtures.generateUsers(usersCount, (index) => {
        return { yearOfBirth: index < usersCount / 2 ? 2000 : 2015 };
      }).then(() => {
        return Fixtures.getUsers({ yearOfBirth: { gt: 2000 } }).then((users) => {
          users.should.have.lengthOf(usersCount / 2);
          users.forEach((user) => {
            user.yearOfBirth.should.be.above(2000);
          });
        });
      });
    });

    it('should correctly filter results with __gte', function () {
      const usersCount = 10;

      return Fixtures.generateUsers(usersCount, (index) => {
        return { yearOfBirth: index < usersCount / 2 ? 2000 : 2015 };
      }).then(() => {
        return Fixtures.getUsers({ yearOfBirth: { gte: 2000 } }).then((users) => {
          users.should.have.lengthOf(usersCount);
          users.forEach((user) => {
            user.yearOfBirth.should.be.at.least(2000);
          });
        });
      });
    });

    it('should correctly filter results with __in', function () {
      const usersCount = 10;
      const values = [0, 1, 2];

      return Fixtures.generateUsers(usersCount, (index) => {
        return { luckyNumber: index };
      }).then(() => {
        return Fixtures.getUsers({ luckyNumber: { in: values } }).then((users) => {
          users.should.have.lengthOf(values.length);
          users.forEach((user) => {
            user.luckyNumber.should.be.oneOf(values);
          });
        });
      });
    });

    it('should correctly filter results with __nin', function () {
      const usersCount = 10;
      const values = [0, 1, 2];

      return Fixtures.generateUsers(usersCount, (index) => {
        return { luckyNumber: index };
      }).then(() => {
        return Fixtures.getUsers({ luckyNumber: { nin: values } }).then((users) => {
          users.should.have.lengthOf(usersCount - values.length);
          users.forEach((user) => {
            user.luckyNumber.should.not.be.oneOf(values);
          });
        });
      });
    });

    it('should reject the request (operator is not supported)', function () {
      return Fixtures.getUsers({
        hasSubscribedEmails: { nin: [true, false] }
      }, {
        statusCode: Restypie.Codes.BadRequest
      });
    });

    it('should return only selected fields', function () {
      const select = ['theId', 'firstName'];

      return Fixtures.generateUsers(10).then(() => {
        return Fixtures.getUsers(null, { select }).then((users) => {
          users.forEach((user) => {
            user.should.have.keys(select);
          });
        });
      });
    });

    it('should sort results (single ASC sort)', function () {
      return Fixtures.generateUsers(10, (index) => {
        return { yearOfBirth: 2000 + index };
      }).then(() => {
        return Fixtures.getUsers(null, { sort: ['yearOfBirth'] }).then((users) => {
          let pre = null;
          users.forEach((user) => {
            if (pre !== null) user.yearOfBirth.should.be.at.least(pre);
            pre = user.yearOfBirth;
          });
        });
      });
    });

    it('should sort results (single DESC sort)', function () {
      return Fixtures.generateUsers(10, (index) => {
        return { yearOfBirth: 2000 + index };
      }).then(() => {
        return Fixtures.getUsers(null, { sort: ['-yearOfBirth'] }).then((users) => {
          let pre = null;
          users.forEach((user) => {
            if (pre !== null) user.yearOfBirth.should.be.at.most(pre);
            pre = user.yearOfBirth;
          });
        });
      });
    });

    it('should sort results (multiple sorts)', function () {
      return Fixtures.generateUsers(10, (index) => {
        const luckyNumber = Math.ceil(index / 2);
        return { luckyNumber, yearOfBirth: 2000 + parseInt((Math.random() * 10 + luckyNumber), 10) };
      }).then(() => {
        return Fixtures.getUsers(null, { sort: ['luckyNumber', '-yearOfBirth'] }).then((users) => {
          let preLuckyNumber = null;
          let preYearOfBirth = null;
          users.forEach((user) => {
            const currentLuckyNumber = user.luckyNumber;
            const currentYearOfBirth = user.yearOfBirth;
            if (preLuckyNumber !== null) {
              currentLuckyNumber.should.be.at.least(preLuckyNumber);
            }
            if (preYearOfBirth !== null && currentLuckyNumber === preLuckyNumber) {
              currentYearOfBirth.should.be.at.most(preYearOfBirth);
            }
            preYearOfBirth = currentYearOfBirth;
            preLuckyNumber = currentLuckyNumber;
          });
        });
      });
    });

    it('should count corresponding objects', function () {
      const defaultLimit = api.resources.users.defaultLimit;
      const usersCount = defaultLimit * 4;

      return Fixtures.generateUsers(usersCount, (index) => {
        return { hasSubscribedEmails: index < usersCount / 2 };
      }).then(() => {
        return Fixtures.getUsers({ hasSubscribedEmails: true }, { return: Fixtures.ReturnTypes.BODY }).then((body) => {
          body.data.should.have.lengthOf(defaultLimit);
          body.meta.total.should.equal(usersCount / 2);
        });
      });
    });

    it('should NOT count corresponding objects (NO_COUNT)', function () {
      const usersCount = 6;

      return Fixtures.generateUsers(usersCount, (index) => {
        return { hasSubscribedEmails: index < usersCount / 2 };
      }).then(() => {
        return Fixtures.getUsers({ hasSubscribedEmails: true }, {
          return: Fixtures.ReturnTypes.BODY,
          options: [Restypie.QueryOptions.NO_COUNT]
        }).then((body) => {
          should.not.exist(body.meta.total);
        });
      });
    });

    it('should deeply filter (1-N relation)', function () {
      const usersCount = 4;

      return Fixtures.generateJob({ name: 'Developer' }).then((job) => {
        return Promise.props({
          job,
          users: Fixtures.generateUsers(usersCount, { job: job.id }),
          otherUsers: Fixtures.generateUsers(5)
        });
      }).then((results) => {
        return Fixtures.getUsers({ 'job.name': 'Developer' }).then((users) => {
          users.should.have.lengthOf(usersCount);
          users.forEach((user) => {
            should.exist(results.users.find((item) => item.theId === user.theId));
            user.job.should.equal(results.job.id);
          });
        });
      });
    });

    it('should deeply filter (N-N relation)', function () {
      const usersCount = 4;

      return Promise.props({
        users: Fixtures.generateUsers(usersCount),
        slackTeam: Fixtures.generateSlackTeam({ name: 'Team3' }),
        otherUsers: Fixtures.generateUsers(5),
        otherSlackTeams: Fixtures.generateSlackTeams(5)
      }).then((results) => {
        return Fixtures.generateUserSlackTeams(usersCount, (index) => {
          return { user: results.users[index].theId, slackTeam: results.slackTeam.id };
        }).then(() => {
          return Fixtures.getUsers({ 'slackTeams.name': 'Team3' }).then((users) => {
            users.should.have.lengthOf(usersCount);
            users.forEach((user) => {
              should.exist(results.users.find((item) => item.theId === user.theId));
            });
          });
        });
      });
    });

    it('should deeply filter (N-N + 1-N relations)', function () {
      const usersCount = 4;

      return Promise.props({
        jobs: Fixtures.generateJobs(2),
        slackTeam: Fixtures.generateSlackTeam({ name: 'Team3' }),
        otherUsers: Fixtures.generateUsers(5),
        otherSlackTeams: Fixtures.generateSlackTeams(5)
      }).then((results) => {
        return Fixtures.generateUsers(usersCount, (index) => {
          return { job: results.jobs[Math.floor(index / 2)].id }
        }).then((users) => {
          return Fixtures.generateUserSlackTeams(usersCount, (index) => {
            return {
              user: users[index].theId,
              slackTeam: index < usersCount / 2 ? results.slackTeam.id : results.otherSlackTeams[index].id
            };
          }).then(() => {
            return Fixtures.getJobs({ 'users.slackTeams.name': 'Team3' }).then((jobs) => {
              jobs.should.have.lengthOf(1);
              jobs[0].should.deep.equal(results.jobs[0]);
            });
          });
        })
      });
    });

    it('should NOT be able to retrieve users with limit=0 (isGetAllAllowed=false)', function () {
      return Fixtures.getUsers({}, { limit: 0, statusCode: Restypie.Codes.Forbidden });
    });

    it('should be able to retrieve users with limit=0 (Restypie sign)', function () {
      return Fixtures.getUsers({}, { limit: 0, forceGetAllAllowed: true });
    });

    it('should only send back meta.score (and not make calls to DB)', function () {
      const getObjects = api.resources.users.getObjects;
      api.resources.users.getObjects = () => { throw new Error('should not have been called') };

      return Fixtures.getUsers({}, {
        return: Fixtures.ReturnTypes.META,
        options: Restypie.QueryOptions.SCORE_ONLY
      }).then((meta) => {
        meta.should.have.keys(['score']);
        api.resources.users.getObjects = getObjects;
      });
    });

    it('should send back meta.score along with usual properties', function () {
      return Fixtures.getUsers({}, {
        return: Fixtures.ReturnTypes.BODY,
        options: Restypie.QueryOptions.INCLUDE_SCORE
      }).then((body) => {
        body.data.should.be.an('array');
        body.meta.should.have.keys(['total', 'next', 'prev', 'limit', 'offset', 'score']);
      });
    });

    it('should NOT be able to fetch users (too much deep nesting)', function () {
      return Fixtures.getUsers({
        'slackTeams.channels.slackTeam.channels.slackTeam.name': 'team'
      }, { statusCode: Restypie.Codes.Forbidden }).then((body) => {
        body.code.should.equal('RequestOutOfRangeError');
      });
    });

    it('should not be able to fetch users (score is too low)', function () {
      return Fixtures.getUsers({
        createdOn: { gt: 0 },
        'slackTeams.channels.name': 'Team'
      }, { statusCode: Restypie.Codes.Forbidden }).then((body) => {
        body.code.should.equal('RequestOutOfRangeError');
      });
    });

  });

};