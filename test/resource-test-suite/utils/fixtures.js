'use strict';

const ReturnTypes = {
  RES: 'res',
  BODY: 'body',
  DATA: 'data',
  META: 'meta'
};

const Utils = require('./');

module.exports = function (supertest, app) {

  return class Fixtures {

    static deleteResource(path, id, options) {
      options = options || {};
      return new Promise((resolve, reject) => {
        supertest(app)
          .delete(Restypie.Url.join(path, id))
          .expect(options.statusCode || Restypie.Codes.NoContent, (err, res) => {
            if (err) return reject(err);
            return resolve(Fixtures.extractReturn(res, options));
          });
      });
    }

    static createResource(path, data, options) {
      options = options || {};

      const req = supertest(app).post(path);

      if (options.attach) {
        Utils.fillMultipartFields(req, data);
        for (const name in options.attach) {
          req.attach(name, options.attach[name]);
        }
      } else {
        req.send(data);
      }

      return new Promise((resolve, reject) => {
        req
          .expect(options.statusCode || Restypie.Codes.Created, (err, res) => {
            if (err) return reject(err);
            return resolve(Fixtures.extractReturn(res, options));
          });
      });
    }

    static resetUsers() {
      return new Promise((resolve, reject) => {
        supertest(app)
          .get('/v1/users')
          .query({ limit: 0, select: 'theId' })
          .expect(Restypie.Codes.OK, (err, res) => {
            if (err) return reject(err);
            return Promise
              .all(res.body.data.map((user) => Fixtures.deleteUser(user.theId)))
              .catch(reject)
              .then(resolve);
          });
        
      });

    }

    static deleteUser(id, options) {
      return Fixtures.deleteResource('/v1/users', id, options);
    }

    static createUser(data, options) {
      return Fixtures.createResource('/v1/users', data, options);
    }

    static extractReturn(res, options) {
      options = options || {};
      
      let returnType = options.return;
      
      if (!returnType && Restypie.Codes.isErrorCode(res.statusCode)) returnType = ReturnTypes.BODY;

      switch (returnType) {
        case ReturnTypes.RES: return res;
        case ReturnTypes.BODY: return res.body;
        case ReturnTypes.DATA: return res.body && res.body.data;
        case ReturnTypes.META: return res.body && res.body.meta;
        default: return res.body && res.body.data;
      }
    }

    static get ReturnTypes() { return ReturnTypes; }

  };

};