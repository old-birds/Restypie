'use strict';

const Restypie = require('../../../');

module.exports = function (supertest, app) {

  return class Fixtures {

    static dropUsers() {
      return new Promise(function (resolve, reject) {
        supertest(app)
          .get('/v1/users')
          .query({ limit: 0, select: 'theId' })
          .expect(Restypie.Codes.OK, function (err, res) {
            if (err) return reject(err);
            return Promise.all(res.body.data.map(function (user) {
              return Fixtures.deleteUser(user.theId);
            }))
              .catch(reject)
              .then(resolve);
          });
        
      });

    }

    static deleteUser(id) {
      return new Promise(function (resolve, reject) {
        supertest(app)
          .delete(`/v1/users/${id}`)
          .expect(Restypie.Codes.NoContent, function (err) {
            if (err) return reject(err);
            return resolve();
          });
      });
    }

  };

};