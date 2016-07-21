'use strict';

const _ = require('lodash');

const Utils = require('./');

let UUID = 0;

const ReturnTypes = {
  RES: 'res',
  BODY: 'body',
  DATA: 'data',
  META: 'meta'
};

module.exports = function (supertest, app) {

  return class Fixtures {
    
    static uuid() {
      return ++UUID;
    }
    
    static getRandomBoolean() {
      return !(Math.random() > 0.5);
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
            if (Restypie.Codes.isErrorCode(res.statusCode) && options.rejectOnError) {
              return reject(Fixtures.extractReturn(res));
            }
            return resolve(Fixtures.extractReturn(res, options));
          });
      });
    }

    static getResource(path, id, options) {
      options = options || {};
      return new Promise((resolve, reject) => {
        supertest(app)
          .get(Restypie.Url.join(path, id))
          .query(Restypie.stringify(_.pick(options, Restypie.RESERVED_WORDS)))
          .expect(options.statusCode || Restypie.Codes.OK, (err, res) => {
            if (err) return reject(err);
            return resolve(Fixtures.extractReturn(res, options));
          });
      });
    }

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

    static createUser(data, options) {
      return Fixtures.createResource('/v1/users', data, options);
    }

    static generateUser(generator) {
      const uuid = Fixtures.uuid();
      const data = Object.assign({
        firstName: `John-${uuid}`,
        lastName: `Doe-${uuid}`,
        email: `john.doe.${uuid}@example.com`,
        yearOfBirth: Fixtures.getRandomBoolean() ? 1986 : 1988,
        password: 'Passw0rd',
        hasSubscribedEmails: Fixtures.getRandomBoolean(),
        gender: Fixtures.getRandomBoolean() ? 'male' : 'female'
      }, Fixtures.parameterToGenerator(generator)());
      
      return Fixtures.createUser(data, { rejectOnError: true });
    }

    static getUser(id, options) {
      return Fixtures.getResource('/v1/users', id, options);
    }

    static deleteUser(id, options) {
      return Fixtures.deleteResource('/v1/users', id, options);
    }

    static parameterToGenerator(generator) {
      const original = generator;
      if (typeof original !== 'function') {
        if (original) generator = () => { return original; };
        else generator = () => {};
      }
      return generator;
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