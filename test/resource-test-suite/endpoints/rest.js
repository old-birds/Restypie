
// Populate jobs
// before(function () {
//   // FIXME drop this
//   return Promise.all([{ name: 'Developer' }, { name: 'Waiter' }].map(function (item) {
//     return new Promise(function (resolve, reject) {
//       return supertest(app)
//         .post('/v1/jobs')
//         .send(item)
//         .expect(Restypie.Codes.Created, function (err) {
//           if (err) return reject(err);
//           return resolve();
//         });
//     });
//   }));
// });

// Populate slack teams
// before(function () {
//   // FIXME drop this
//   let teams = [];
//   _.times(10, (n) => teams.push({ name: 'Team' + n }));
//   return Promise.all(teams.map(function (item) {
//     return new Promise(function (resolve, reject) {
//       return supertest(app)
//         .post('/v1/slack-teams')
//         .send(item)
//         .expect(Restypie.Codes.Created, function (err) {
//           if (err) return reject(err);
//           return resolve();
//         });
//     });
//   }));
// });

// Populate slack channels
// before(function () {
//   // FIXME drop this
//   let channels = [];
//   _.times(5, (n) => channels.push({ name: 'Channel' + n, slackTeam: 1 }));
//   return Promise.all(channels.map(function (item) {
//     return new Promise(function (resolve, reject) {
//       return supertest(app)
//         .post('/v1/slack-team-channels')
//         .send(item)
//         .expect(Restypie.Codes.Created, function (err) {
//           if (err) return reject(err);
//           return resolve();
//         });
//     });
//   }));
// });

// Populate slack teams members
// before(function () {
//   // FIXME drop this
//   let teamsPerUser = [{
//     user: 1,
//     teams: [1, 2, 3, 4]
//   }, {
//     user: 2,
//     teams: [4, 5, 6, 7, 8, 9, 10]
//   }];
//
//   return Promise.all(teamsPerUser.map(function (group) {
//     return Promise.all(group.teams.map(function (slackTeam) {
//       return new Promise(function (resolve, reject) {
//         return supertest(app)
//           .post('/v1/user-slack-teams')
//           .send({ user: group.user, slackTeam })
//           .expect(Restypie.Codes.Created, function (err) {
//             if (err) return reject(err);
//             return resolve();
//           });
//       });
//     }));
//   }));
// });




// Setup and launch the api


/**
 * Util function to reset the users in the storage and fill it with newly generated ones.
 */
// function resetAndFillUsers(count, generator, done) {
//   if (arguments.length === 2) {
//     done = generator;
//     generator = function () { return {}; };
//   }
//
//   return api.resources.users.getObjects({
//     filters: {},
//     sort: [],
//     select: ['id'],
//     limit: 3,
//     offset: 0
//   }).then(function (objects) {
//     return Promise.all(objects.map(function (object) {
//       return api.resources.users.deleteObject({ filters: { id: object.id } });
//     }));
//   }).then(function () {
//
//     if (!count) return Promise.resolve([]);
//
//     let users = [];
//     for (let i = 0; i < count; i++) {
//       users.push(Object.assign({
//         theId: i + 1,
//         firstName: 'John' + Date.now(),
//         lastName: 'Doe' + Date.now(),
//         email: `john.doe${i}@example.com`,
//         yearOfBirth: 1900 + parseInt(Math.random() * 100, 10),
//         password: 'Passw0rd',
//         job: Math.random() < 0.5 ? 1 : 2,
//         hasSubscribedEmails: Math.random() < 0.5,
//         gender: Math.random() < 0.5 ? 'male' : 'female'
//       }, generator(i)));
//     }
//
//     return Promise.all(users.map(function (user) {
//       return new Promise(function (resolve, reject) {
//         return supertest(app)
//           .post('/v1/users')
//           .send(user)
//           .expect(Restypie.Codes.Created, function (err, res) {
//             if (err) return reject(err);
//             return resolve(res.body.data);
//           });
//       });
//     }));
//   }).then(function () {
//     return done(null, Array.from(arguments)[0]);
//   }, done);
// }
















describe('GET many', function () {
  let count = 88;

  it('Preparing tests...', function (done) {
    return resetAndFillUsers(count, function (i) {
      let isInferior = i < count / 2;
      return { hasSubscribedEmails: isInferior, yearOfBirth: i === 7 ? 1986 : isInferior ? 1950 : 2000 };
    }, done);
  });

  it('should retrieve `defaultLimit` users', function (done) {
    let defaultLimit = api.resources.users.defaultLimit;
    return supertest(app)
      .get('/v1/users?' + QS.stringify({ hasSubscribedEmails: true }))
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        let body = res.body;
        body.data.should.be.an('array');
        body.meta.should.be.an('object');
        body.data.length.should.equal(defaultLimit);
        body.meta.total.should.equal(count / 2);
        (body.meta.prev === null).should.equal(true);
        body.meta.next.should.be.a('string');
        return done();
      });
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
    return supertest(app)
      .get('/v1/jobs' + '?' + QS.stringify({ populate: 'users' }))
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

  it('should populate otherJobPopulation', function (done) {
    return supertest(app)
      .get('/v1/users')
      .query({ populate: 'otherJobPopulation,job' })
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        const data = res.body.data;
        data.should.be.an('array');
        data.forEach(function (item) {
          item.otherJobPopulation.should.deep.equal(item.job);
        });
        return done();
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
          return supertest(app)
            .get('/v1/user-slack-teams?' + QS.stringify({ user: item.theId, limit: 1 }))
            .end(function (err, res) {
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

          return supertest(app)
            .get('/v1/user-slack-teams?' + QS.stringify({ user: item.theId, limit: 1 }))
            .end(function (err, res) {
              if (err) return onItem(err);

              item.slackTeams.length.should.equal(res.body.meta.total);

              return async.each(item.slackTeams, function (team, cb) {
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
          return supertest(app)
            .get('/v1/user-slack-teams?' + QS.stringify({ slackTeam: item.id, limit: 1 }))
            .end(function (err, res) {
              if (err) return cb(err);
              item.users.length.should.equal(res.body.meta.total);
              return cb();
            });
        }, done);
      });
  });

  it('should retrieve users based on `limit`', function (done) {
    let limit = 40;
    return supertest(app)
      .get('/v1/users?' + QS.stringify({ hasSubscribedEmails: true, limit }))
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        let body = res.body;
        body.data.should.be.an('array');
        body.meta.should.be.an('object');
        body.data.length.should.equal(limit);
        body.meta.total.should.equal(count / 2);
        (body.meta.prev === null).should.equal(true);
        body.meta.next.should.be.a('string');
        return done();
      });
  });

  it('should retrieve users based on `limit` (higher than the objects count)', function (done) {
    let limit = 50;
    return supertest(app)
      .get('/v1/users?' + QS.stringify({ hasSubscribedEmails: true, limit }))
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        let body = res.body;
        body.data.should.be.an('array');
        body.meta.should.be.an('object');
        body.data.length.should.equal(count / 2);
        body.meta.total.should.equal(count / 2);
        (body.meta.prev === null).should.equal(true);
        (body.meta.next === null).should.equal(true);
        return done();
      });
  });

  it('should reject the request (limit exceeds `resource.maxLimit`)', function (done) {
    let limit = api.resources.users.maxLimit + 1;
    return supertest(app)
      .get('/v1/users?' + QS.stringify({ hasSubscribedEmails: true, limit }))
      .expect(Restypie.Codes.Forbidden, function (err, res) {
        if (err) return done(err);
        let body = res.body;
        body.error.should.equal(true);
        body.meta.should.be.an('object');
        body.meta.key.should.equal('limit');
        return done();
      });
  });

  it('should reject the request (limit is not an integer)', function (done) {
    let limit = 'foo';
    return supertest(app)
      .get('/v1/users?' + QS.stringify({ hasSubscribedEmails: true, limit }))
      .expect(Restypie.Codes.BadRequest, function (err, res) {
        if (err) return done(err);
        let body = res.body;
        body.error.should.equal(true);
        body.meta.should.be.an('object');
        body.meta.key.should.equal('limit');
        return done();
      });
  });

  it('should reject the request (limit is not positive)', function (done) {
    let limit = -1;
    return supertest(app)
      .get('/v1/users?' + QS.stringify({ hasSubscribedEmails: true, limit }))
      .expect(Restypie.Codes.Forbidden, function (err, res) {
        if (err) return done(err);
        let body = res.body;
        body.error.should.equal(true);
        body.meta.should.be.an('object');
        body.meta.key.should.equal('limit');
        return done();
      });
  });

  it('should skip 5 users', function (done) {
    let offset = 5;
    let limit = 10;

    return supertest(app)
      .get('/v1/users?' + QS.stringify({ hasSubscribedEmails: true, limit }))
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        let first = res.body.data;
        first.length.should.equal(limit);

        return supertest(app)
          .get('/v1/users?' + QS.stringify({ hasSubscribedEmails: true, offset, limit }))
          .expect(Restypie.Codes.OK, function (err, res) {
            if (err) return done(err);
            let second = res.body.data;
            second.length.should.equal(limit);
            second[0].theId.should.equal(first[offset].theId);
            return done();
          });
      });
  });

  it('should retrieve no user (offset is too high)', function (done) {
    let offset = 500;
    return supertest(app)
      .get('/v1/users?' + QS.stringify({ hasSubscribedEmails: true, offset }))
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        let body = res.body;
        body.data.should.be.an('array');
        body.meta.should.be.an('object');
        body.data.length.should.equal(0);
        body.meta.total.should.equal(count / 2);
        (body.meta.prev === null).should.equal(true);
        (body.meta.next === null).should.equal(true);
        return done();
      });
  });

  it('should reject the request (offset is not an integer)', function (done) {
    let offset = 'foo';
    return supertest(app)
      .get('/v1/users?' + QS.stringify({ hasSubscribedEmails: true, offset }))
      .expect(Restypie.Codes.BadRequest, function (err, res) {
        if (err) return done(err);
        let body = res.body;
        body.error.should.equal(true);
        body.meta.should.be.an('object');
        body.meta.key.should.equal('offset');
        return done();
      });
  });

  it('should reject the request (offset is not positive)', function (done) {
    let offset = -3;
    return supertest(app)
      .get('/v1/users?' + QS.stringify({ hasSubscribedEmails: true, offset }))
      .expect(Restypie.Codes.Forbidden, function (err, res) {
        if (err) return done(err);
        let body = res.body;
        body.error.should.equal(true);
        body.meta.should.be.an('object');
        body.meta.key.should.equal('offset');
        return done();
      });
  });

  it('should correctly filter results with __ne', function (done) {
    return supertest(app)
      .get('/v1/users?' + QS.stringify({ hasSubscribedEmails__ne: false }))
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);

        let prev = res.body.data;

        return supertest(app)
          .get('/v1/users?' + QS.stringify({ hasSubscribedEmails: true }))
          .expect(Restypie.Codes.OK, function (err, res) {
            if (err) return done(err);
            res.body.data.length.should.equal(prev.length);
            return done();
          });
      });
  });

  it('should correctly filter results with __lt', function (done) {
    return supertest(app)
      .get('/v1/users?' + QS.stringify({ yearOfBirth__lt: 2000 }))
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        res.body.meta.total.should.equal(count / 2);
        return done();
      });
  });

  it('should correctly filter results with __lte', function (done) {
    return supertest(app)
      .get('/v1/users?' + QS.stringify({ yearOfBirth__lte: 2000 }))
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        res.body.meta.total.should.equal(count);
        return done();
      });
  });

  it('should correctly filter results with __gt', function (done) {
    return supertest(app)
      .get('/v1/users?' + QS.stringify({ yearOfBirth__gt: 1950 }))
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        res.body.meta.total.should.equal(count / 2 + 1);
        return done();
      });
  });

  it('should correctly filter results with __gt', function (done) {
    return supertest(app)
      .get('/v1/users?' + QS.stringify({ yearOfBirth__gte: 1950 }))
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        res.body.meta.total.should.equal(count);
        return done();
      });
  });

  it('should correctly filter results with __in', function (done) {
    return supertest(app)
      .get('/v1/users?' + QS.stringify({ yearOfBirth__in: '1950, 1986' }))
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        res.body.meta.total.should.equal(count / 2);
        return done();
      });
  });

  it('should correctly filter results with __nin', function (done) {
    return supertest(app)
      .get('/v1/users?' + QS.stringify({ yearOfBirth__nin: '1950, 1986' }))
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        res.body.meta.total.should.equal(count / 2);
        return done();
      });
  });

  it('should reject the request (operator is not supported)', function (done) {
    return supertest(app)
      .get('/v1/users?' + QS.stringify({ hasSubscribedEmails__nin: 'true,false' }))
      .expect(Restypie.Codes.BadRequest, done);
  });

  it('should return only selected fields', function (done) {
    return supertest(app)
      .get('/v1/users?' + QS.stringify({ select: 'theId,firstName' }))
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        let data = res.body.data;
        data.forEach(function (item) { item.should.have.keys(['theId', 'firstName']); });
        return done();
      });
  });

  it('should sort results (single ASC sort)', function (done) {
    return supertest(app)
      .get('/v1/users?' + QS.stringify({ sort: 'email' }))
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        let data = res.body.data;
        let prev = null;
        data.forEach(function (current) {
          current = current.email;
          if (prev !== null) current.should.be.at.least(prev);
          prev = current;
        });
        return done();
      });
  });

  it('should sort results (single DESC sort)', function (done) {
    return supertest(app)
      .get('/v1/users?' + QS.stringify({ sort: '-email' }))
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        let data = res.body.data;
        let prev = null;
        data.forEach(function (current) {
          current = current.email;
          if (prev !== null) current.should.be.at.most(prev);
          prev = current;
        });
        return done();
      });
  });

  it('should sort results (multiple sorts)', function (done) {
    return supertest(app)
      .get('/v1/users?' + QS.stringify({ sort: 'hasSubscribedEmails,-job', limit: 50 }))
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        let data = res.body.data;
        let prev = false;
        data.forEach(function (item) {
          item.hasSubscribedEmails.should.be.at.least(prev);
          prev = item.hasSubscribedEmails;
        });

        let groupedByEmails = _.groupBy(data, 'hasSubscribedEmails');

        Object.keys(groupedByEmails).forEach(function (bool) {
          let prev = null;
          groupedByEmails[bool].forEach(function (item) {
            if (prev !== null) item.job.should.at.most(prev);
            prev = item.job;
          });
        });

        return done();
      });
  });

  it('should count corresponding objects', function (done) {
    return supertest(app)
      .get('/v1/users')
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        const body = res.body;
        should.exist(body.meta);
        should.exist(body.meta.total);
        body.meta.total.should.be.a('number');
        body.meta.total.should.be.above(0);
        return done();
      });
  });

  it('should NOT count corresponding objects (NO_COUNT)', function (done) {
    return supertest(app)
      .get('/v1/users')
      .query({ options: 'noCount' })
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        const body = res.body;
        should.exist(body.meta);
        should.not.exist(body.meta.total);
        return done();
      });
  });

  it('Preparing tests...', function (done) {
    return resetAndFillUsers(10, function (i) {
      let isInferior = i < 5;
      return { job: isInferior ? 1 : 2 };
    }, done);
  });


  it('should deeply filter (1-N relation)', function (done) {
    // GET users that are Developer
    return supertest(app)
      .get('/v1/users')
      .query({ 'job.name': 'Developer' })
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        const data = res.body.data;
        data.length.should.equal(5);
        data.forEach(function (user) {
          user.job.should.equal(1);
        });
        return done();
      });
  });
  
  it('should deeply filter (N-N relation)', function (done) {
    // GET users who subscribed to slack team named Team3
    return supertest(app)
      .get('/v1/users')
      .query({ 'slackTeams.name': 'Team3' })
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        const data = res.body.data;
        data.length.should.equal(2);
        _.pluck(data, 'theId').should.deep.equal([1, 2]);
        return done();
      });
  });

  it('should deeply filter (N-N + 1-N relations)', function (done) {
    // GET jobs that have users who subscribed to slack team names Team3
    return supertest(app)
      .get('/v1/jobs')
      .query({ 'users.slackTeams.name': 'Team3' })
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        const data = res.body.data;
        console.log(data);
        data.length.should.equal(1);
        data[0].id.should.equal(1);
        return done();
      });
  });

});



describe('PATCH single', function () {

  it('Preparing tests...', function (done) {
    return resetAndFillUsers(5, done);
  });

  it('should update a user (no profile picture)', function (done) {
    return supertest(app)
      .get('/v1/users?' + QS.stringify({ limit: 1 }))
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        let pre = res.body.data[0];
        if (!pre) return done(new Error('Couldnt find any user'));

        let update = { firstName: 'JohnTheFirst', yearOfBirth: 1987 };

        return supertest(app)
          .patch('/v1/users/' + pre.theId)
          .send(update)
          .expect(Restypie.Codes.NoContent, function (err) {
            if (err) return done(err);

            return supertest(app)
              .get('/v1/users/' + pre.theId)
              .expect(Restypie.Codes.OK, function (err, res) {
                if (err) return done(err);
                let post = res.body.data;
                if (!post) return done(new Error('Couldnt retrieve user'));
                post.firstName.should.equal(update.firstName);
                post.yearOfBirth.should.equal(update.yearOfBirth);
                return done();
              });
          });
      });
  });

  it('should update a user (with profile picture)', function (done) {
    return supertest(app)
      .get('/v1/users?' + QS.stringify({ limit: 1, offset: 1 }))
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        let pre = res.body.data[0];
        if (!pre) return done(new Error('Couldnt find any user'));

        let update = { firstName: 'JohnTheSecond' };
        let req = supertest(app).patch('/v1/users/' + pre.theId);
        fillMultipartFields(req, update);

        return req
          .attach('profilePicture', __dirname + '/fixtures/profile-picture.png')
          .expect(Restypie.Codes.NoContent, function (err) {
            if (err) return done(err);

            return supertest(app)
              .get('/v1/users/' + pre.theId)
              .expect(Restypie.Codes.OK, function (err, res) {
                if (err) return done(err);
                let post = res.body.data;
                if (!post) return done(new Error('Couldnt retrieve user'));
                post.firstName.should.equal(update.firstName);
                post.profilePicture.should.be.a('string');
                return done();
              });
          });
      });
  });

  it('should not update a user (password can only be written once)', function (done) {
    return supertest(app)
      .get('/v1/users?' + QS.stringify({ limit: 1, offset: 2 }))
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        let pre = res.body.data[0];
        if (!pre) return done(new Error('Couldnt find any user'));

        let update = { password: 'Passw0rd123' };

        return supertest(app)
          .patch('/v1/users/' + pre.theId)
          .send(update)
          .expect(Restypie.Codes.Forbidden, function (err, res) {
            if (err) return done(err);

            let body = res.body;
            body.error.should.equal(true);
            body.meta.should.be.an('object');
            body.meta.key.should.equal('password');

            return done();
          });
      });
  });

  it('should not update a user (yearOfBirth is out of range)', function (done) {
    return supertest(app)
      .get('/v1/users?' + QS.stringify({ limit: 1, offset: 3 }))
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        let pre = res.body.data[0];
        if (!pre) return done(new Error('Couldnt find any user'));

        let update = { yearOfBirth: 1000 };

        return supertest(app)
          .patch('/v1/users/' + pre.theId)
          .send(update)
          .expect(Restypie.Codes.Forbidden, function (err, res) {
            if (err) return done(err);

            let body = res.body;
            body.error.should.equal(true);
            body.meta.should.be.an('object');
            body.meta.key.should.equal('yearOfBirth');

            return supertest(app)
              .get('/v1/users/' + pre.theId)
              .expect(Restypie.Codes.OK, function (err, res) {
                if (err) return done(err);
                let post = res.body.data;
                if (!post) return done(new Error('Couldnt retrieve user'));
                post.yearOfBirth.should.equal(pre.yearOfBirth);
                return done();
              });
          });
      });
  });

  it('should not update a user (hasSubscribedEmails is not a boolean)', function (done) {
    return supertest(app)
      .get('/v1/users?' + QS.stringify({ limit: 1, offset: 4 }))
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        let pre = res.body.data[0];
        if (!pre) return done(new Error('Could not find any user'));

        let update = { hasSubscribedEmails: 1000 };

        return supertest(app)
          .patch('/v1/users/' + pre.theId)
          .send(update)
          .expect(Restypie.Codes.BadRequest, function (err, res) {
            if (err) return done(err);

            let body = res.body;
            body.error.should.equal(true);
            body.meta.should.be.an('object');
            body.meta.key.should.equal('hasSubscribedEmails');

            return supertest(app)
              .get('/v1/users/' + pre.theId)
              .expect(Restypie.Codes.OK, function (err, res) {
                if (err) return done(err);
                let post = res.body.data;
                if (!post) return done(new Error('Could not retrieve user'));
                post.hasSubscribedEmails.should.equal(pre.hasSubscribedEmails);
                return done();
              });
          });
      });
  });

  it('should send back a 404', function (done) {
    let id = parseInt(Math.random() * 1000);

    return supertest(app)
      .patch('/v1/users/' + id)
      .set('Content-Type', 'multipart/form-data; boundary=foo')
      .expect(Restypie.Codes.NotFound, function (err, res) {
        if (err) return done(err);
        let data = res.body;
        data.error.should.equal(true);
        data.meta.should.should.be.an('object');
        data.meta.pk.should.equal(id);
        return done();
      });
  });

});

describe('PATCH many', function () {

  it('Preparing tests...', function (done) {
    return resetAndFillUsers(50, done);
  });

  it('should update users (no profile picture)', function (done) {
    let update = { firstName: 'Updated', yearOfBirth: 2001 };
    let filters = QS.stringify({ yearOfBirth__gt: 1950, limit: 0 });

    return supertest(app)
      .patch('/v1/users?' + filters)
      .send(update)
      .expect(Restypie.Codes.NoContent, function (err) {
        if (err) return done(err);

        return supertest(app)
          .get('/v1/users?' + filters)
          .expect(Restypie.Codes.OK, function (err, res) {
            if (err) return done(err);
            res.body.data.forEach(function (object) {
              object.firstName.should.equal(update.firstName);
              object.yearOfBirth.should.equal(update.yearOfBirth);
            });
            return done();
          });
      });
  });

  it('should update users (with profile picture)', function (done) {
    let update = { firstName: 'Updated with picture' };
    let filters = QS.stringify({ yearOfBirth__lte: 1950, limit: 0 });
    let req = supertest(app).patch('/v1/users?' + filters);
    fillMultipartFields(req, update);

    return req
      .attach('profilePicture', __dirname + '/fixtures/profile-picture.png')
      .expect(Restypie.Codes.NoContent, function (err) {
        if (err) return done(err);

        return supertest(app)
          .get('/v1/users?' + filters)
          .expect(Restypie.Codes.OK, function (err, res) {
            if (err) return done(err);
            let profilePicture = null;
            res.body.data.forEach(function (object) {
              object.firstName.should.equal(update.firstName);
              profilePicture = profilePicture || object.profilePicture;
              object.profilePicture.should.equal(profilePicture);
            });
            return done();
          });
      });
  });

  it('should not update users (password can only be written once)', function (done) {
    let update = { password: 'Passw0rd123' };
    let filters = QS.stringify({ yearOfBirth__gt: 0 });

    return supertest(app)
      .patch('/v1/users?' + filters)
      .send(update)
      .expect(Restypie.Codes.Forbidden, function (err, res) {
        if (err) return done(err);

        let body = res.body;
        body.error.should.equal(true);
        body.meta.should.be.an('object');
        body.meta.key.should.equal('password');

        return done();
      });
  });

  it('should not update users (yearOfBirth is out of range)', function (done) {
    let update = { yearOfBirth: 1000 };
    let filters = QS.stringify({ yearOfBirth__gt: 0 });

    return supertest(app)
      .patch('/v1/users?' + filters)
      .send(update)
      .expect(Restypie.Codes.Forbidden, function (err, res) {
        if (err) return done(err);

        let body = res.body;
        body.error.should.equal(true);
        body.meta.should.be.an('object');
        body.meta.key.should.equal('yearOfBirth');

        return done();
      });
  });

  it('should not update users (hasSubscribedEmails is not a boolean)', function (done) {
    let update = { hasSubscribedEmails: 1000 };
    let filters = QS.stringify({ yearOfBirth__gt: 0 });

    return supertest(app)
      .patch('/v1/users?' + filters)
      .send(update)
      .expect(Restypie.Codes.BadRequest, function (err, res) {
        if (err) return done(err);

        let body = res.body;
        body.error.should.equal(true);
        body.meta.should.be.an('object');
        body.meta.key.should.equal('hasSubscribedEmails');

        return done();
      });
  });

  it('should reject the request if no filters', function (done) {
    return supertest(app)
      .patch('/v1/users')
      .send({ hasSubscribedEmails: true })
      .expect(Restypie.Codes.Forbidden, function (err, res) {
        if (err) return done(err);

        let body = res.body;
        body.error.should.equal(true);
        body.code.should.equal('RequestOutOfRangeError');

        return done();
      });
  });

});




describe('PUT', function () {

  it('Preparing tests...', function (done) {
    if (!UsersResource.prototype.supportsUpserts) return this.skip();
    return resetAndFillUsers(0, done);
  });

  it('should create a user', function (done) {
    if (!UsersResource.prototype.supportsUpserts) return this.skip();
    return supertest(app)
      .put('/v1/users?' + QS.stringify({ email: 'john.doe@example.com' }))
      .send({
        firstName: 'John',
        lastName: 'Doe',
        yearOfBirth: 1986,
        password: 'Passw0rd',
        job: 1,
        hasSubscribedEmails: true,
        gender: 'male'
      })
      .expect(Restypie.Codes.Created, function (err, res) {
        if (err) return done(err);
        let data = res.body.data;
        should.exist(data);
        data.should.be.an('object');
        data.email.should.equal('john.doe@example.com');
        return done();
      });
  });

  it('should update the created user', function (done) {
    if (!UsersResource.prototype.supportsUpserts) return this.skip();
    return supertest(app)
      .put('/v1/users?' + QS.stringify({ email: 'john.doe@example.com' }))
      .send({
        firstName: 'John',
        lastName: 'Doe',
        yearOfBirth: 1988,
        password: 'Passw0rd',
        job: 1,
        hasSubscribedEmails: true,
        gender: 'male'
      })
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        let data = res.body.data;
        should.exist(data);
        data.should.be.an('object');
        data.yearOfBirth.should.equal(1988);
        return done();
      });
  });

  it('should NOT create a user (no upsert keys)', function (done) {
    if (!UsersResource.prototype.supportsUpserts) return this.skip();
    return supertest(app)
      .put('/v1/users?' + QS.stringify({ firstName: 'John' }))
      .send({
        email: 'john2.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        yearOfBirth: 1986,
        password: 'Passw0rd',
        job: 1,
        hasSubscribedEmails: true,
        gender: 'male'
      })
      .expect(Restypie.Codes.Forbidden, done);
  });
});


describe('DELETE single', function () {

  it('Preparing tests...', function (done) {
    return resetAndFillUsers(1, done);
  });

  it('should delete a user', function (done) {
    return supertest(app)
      .get('/v1/users?' + QS.stringify({ limit: 1 }))
      .expect(Restypie.Codes.OK, function (err, res) {
        if (err) return done(err);
        let pre = res.body.data[0];
        if (!pre) return done(new Error('Could not find any user'));

        return supertest(app)
          .delete('/v1/users/' + pre.theId)
          .expect(Restypie.Codes.NoContent, function (err) {
            if (err) return done(err);

            return supertest(app)
              .get('/v1/users/' + pre.theId)
              .expect(Restypie.Codes.NotFound, done);
          });
      });
  });

  it('should send back a 404', function (done) {
    let id = Date.now();

    return supertest(app)
      .delete('/v1/users/' + id)
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
      .delete('/v1/users/' + id)
      .expect(Restypie.Codes.BadRequest, function (err, res) {
        if (err) return done(err);
        let data = res.body;
        data.error.should.equal(true);
        data.meta.should.should.be.an('object');
        data.meta.key.should.equal('theId');
        return done();
      });
  });

});