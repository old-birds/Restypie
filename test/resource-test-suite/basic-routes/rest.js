
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