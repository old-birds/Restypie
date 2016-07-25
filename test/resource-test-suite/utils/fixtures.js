'use strict';

const _ = require('lodash');
const Promise = require('bluebird');

const Utils = require('./');

let UUID = 0;

const ReturnTypes = {
  RES: 'res',
  BODY: 'body',
  DATA: 'data',
  META: 'meta'
};

module.exports = function (supertest, app, api) {

  return class Fixtures {

    /*******************************************************************************************************************
     * Utils
     */
    static get ReturnTypes() { return ReturnTypes; }

    static uuid() {
      return ++UUID;
    }

    static getRandomBoolean() {
      return !(Math.random() > 0.5);
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


    /*******************************************************************************************************************
     * General
     */
    static reset() {
      return Promise.all([
        api.resources.jobs.reset(),
        api.resources.slackTeamChannels.reset(),
        api.resources.userSlackTeams.reset(),
        api.resources.slackTeams.reset(),
        api.resources.users.reset()
      ]);
    }

    /*******************************************************************************************************************
     * Generic resources
     */
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

    static getResources(path, filters, options) {
      filters = filters || {};
      options = options || {};
      
      return new Promise((resolve, reject) => {
        supertest(app)
          .get(path)
          .query(Object.assign(
            Restypie.stringify({ filters }),
            Restypie.stringify(_.pick(options, Restypie.RESERVED_WORDS))
          ))
          .expect(options.statusCode || Restypie.Codes.OK, (err, res) => {
            if (err) return reject(err);
            return resolve(Fixtures.extractReturn(res, options));
          });
      });
    }
    
    static updateResource(path, id, updates, options) {
      options = options || {};

      const req = supertest(app).patch(Restypie.Url.join(path, id));

      if (options.attach) {
        Utils.fillMultipartFields(req, updates);
        for (const name in options.attach) {
          req.attach(name, options.attach[name]);
        }
      } else {
        req.send(updates);
      }

      return new Promise((resolve, reject) => {
        req
          .expect(options.statusCode || Restypie.Codes.NoContent, (err, res) => {
            if (err) return reject(err);
            if (Restypie.Codes.isErrorCode(res.statusCode)) return resolve(Fixtures.extractReturn(res));
            if (options.return) return Fixtures.getResource(path, id).then(resolve).catch(reject);
            return resolve();
          });
      });
    }

    static updateResources(path, filters, updates, options) {
      options = options || {};

      let returnIds;
      let primaryKey;
      
      function doUpdate() {
        
        const req = supertest(app)
          .patch(path)
          .query(Restypie.stringify({ filters }));
        
        if (options.attach) {
          Utils.fillMultipartFields(req, updates);
          for (const name in options.attach) {
            req.attach(name, options.attach[name]);
          }
        } else {
          req.send(updates);
        }
        
        return new Promise((resolve, reject) => {
          req
            .expect(options.statusCode || Restypie.Codes.NoContent, (err, res) => {
              if (err) return reject(err);
              if (Restypie.Codes.isErrorCode(res.statusCode)) return resolve(Fixtures.extractReturn(res));
              if (options.return) {
                return Fixtures.getResources(path, { [primaryKey]: { in: returnIds } }, {
                  limit: 0
                }).then(resolve).catch(reject);
              }
              return resolve();
            });
        });
      }

      if (options.return) {
        return Fixtures.getResources(path, filters, { limit: 0, select: ['$primaryKey'] }).then((resources) => {
          returnIds = resources.map((resource) => {
            primaryKey = Object.keys(resource)[0];
            return resource[primaryKey];
          });

          return doUpdate();
        });
      } else {
        return doUpdate(); 
      }

    }
    
    static upsertResource(path, filters, data, options) {
      options = options || {};
      if (!options.statusCode) throw new Error('options.statusCode must be provided');
      
      return new Promise((resolve, reject) => {
        supertest(app)
          .put(path)
          .query(Restypie.stringify({ filters }))
          .send(data)
          .expect(options.statusCode, (err, res) => {
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

    static generateResources(count, generator, method) {
      generator = Fixtures.parameterToGenerator(generator);

      let index = -1;
      const results = [];
      return (function loop() {
        if (++index < count) {
          return method(generator(index)).then((item) => {
            results.push(item);
            return loop();
          });
        }

        return Promise.resolve(results);
      })();
    }

    /*******************************************************************************************************************
     * Users
     */
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
      
      const pre = {};
      
      if (!data.job) pre.job = Fixtures.generateJob();
      
      return Promise.props(pre).then((results) => {
        if (results.job) data.job = results.job.id;
        return Fixtures.createUser(data, { rejectOnError: true });
      });
    }

    static generateUsers(count, generator) {
      return Fixtures.generateResources(count, generator, Fixtures.generateUser);
    }

    static getUser(id, options) {
      return Fixtures.getResource('/v1/users', id, options);
    }

    static getUsers(filters, options) {
      return Fixtures.getResources('/v1/users', filters, options);
    }

    static deleteUser(id, options) {
      return Fixtures.deleteResource('/v1/users', id, options);
    }
    
    static updateUser(id, updates, options) {
      return Fixtures.updateResource('/v1/users', id, updates, options);
    }
    
    static upsertUser(filters, data, options) {
      return Fixtures.upsertResource('/v1/users', filters, data, options);
    }
    
    static updateUsers(filters, updates, options) {
      return Fixtures.updateResources('/v1/users', filters, updates, options);
    }

    /*******************************************************************************************************************
     * Jobs
     */
    static createJob(data, options) {
      return Fixtures.createResource('/v1/jobs', data, options);
    }

    static getJob(id, options) {
      return Fixtures.getResource('/v1/jobs', id, options);
    }

    static getJobs(filters, options) {
      return Fixtures.getResources('/v1/jobs', filters, options);
    }

    static generateJob(generator) {
      const data = Object.assign({
        name: `Developer-${Fixtures.uuid()}`
      }, Fixtures.parameterToGenerator(generator)());

      return Fixtures.createJob(data, { rejectOnError: true });
    }

    static generateJobs(count, generator) {
      return Fixtures.generateResources(count, generator, Fixtures.generateJob);
    }

    /*******************************************************************************************************************
     * SlackTeams
     */
    static deleteSlackTeam(id, options) {
      return Fixtures.deleteResource('/v1/slack-teams', id, options);
    }
    
    static createSlackTeam(data, options) {
      return Fixtures.createResource('/v1/slack-teams', data, options);
    }

    static getSlackTeam(id, options) {
      return Fixtures.getResource('/v1/slack-teams', id, options);
    }

    static getSlackTeams(filters, options) {
      return Fixtures.getResources('/v1/slack-teams', filters, options);
    }

    static generateSlackTeam(generator) {
      const data = Object.assign({
        name: `Team-${Fixtures.uuid()}`
      }, Fixtures.parameterToGenerator(generator)());

      return Fixtures.createSlackTeam(data, { rejectOnError: true });
    }

    static generateSlackTeams(count, generator) {
      return Fixtures.generateResources(count, generator, Fixtures.generateSlackTeam);
    }

    /*******************************************************************************************************************
     * UserSlackTeams
     */
    static deleteUserSlackTeam(id, options) {
      return Fixtures.deleteResource('/v1/user-slack-teams', id, options);
    }

    static createUserSlackTeam(data, options) {
      return Fixtures.createResource('/v1/user-slack-teams', data, options);
    }

    static generateUserSlackTeam(generator) {
      const data = Object.assign({}, Fixtures.parameterToGenerator(generator)());

      const pre = {};
      
      if (!data.user) pre.user = Fixtures.generateUser();
      if (!data.slackTeam) pre.slackTeam = Fixtures.generateSlackTeam();
      
      return Promise.props(pre).then((results) => {
        if (results.user) data.user = results.user.theId;
        if (results.slackTeam) data.slackTeam = results.slackTeam.id;
        return Fixtures.createUserSlackTeam(data, { rejectOnError: true });
      });

    }

    static generateUserSlackTeams(count, generator) {
      return Fixtures.generateResources(count, generator, Fixtures.generateUserSlackTeam);
    }

    /*******************************************************************************************************************
     * SlackTeamChannels
     */
    static resetSlackTeamChannels() {
      return Fixtures.resetResources('/v1/slack-team-channels');
    }

    static deleteSlackTeamChannel(id, options) {
      return Fixtures.deleteResource('/v1/slack-team-channels', id, options);
    }

    static createSlackTeamChannel(data, options) {
      return Fixtures.createResource('/v1/slack-team-channels', data, options);
    }

    static generateSlackTeamChannel(generator) {
      const data = Object.assign({
        name: `Channel-${Fixtures.uuid()}`
      }, Fixtures.parameterToGenerator(generator)());

      const pre = {};

      if (!data.slackTeam) pre.slackTeam = Fixtures.generateSlackTeam();

      return Promise.props(pre).then((results) => {
        if (results.slackTeam) data.slackTeam = results.slackTeam.id;
        return Fixtures.createSlackTeamChannel(data, { rejectOnError: true });
      });
    }

    static generateSlackTeamChannels(count, generator) {
      return Fixtures.generateResources(count, generator, Fixtures.generateSlackTeamChannel);
    }
    
  };


};