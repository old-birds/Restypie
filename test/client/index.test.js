'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const _ = require('lodash');
const nock = require('nock');

const PORT = 9999;
const HOST = 'http://localhost:' + PORT;

let app = express();
let server;
app.set('port', PORT);
app.use(bodyParser.json());

const api = new Restypie.API({ path: 'v1', routerType: Restypie.RouterTypes.EXPRESS });

class PostRoute extends Restypie.BasicRoutes.PostRoute {
  get allowsMany() { return true; }
}

class UsersResource extends Restypie.Resources.FixturesResource {
  get path() { return 'users'; }
  get routes() {
    return [
      PostRoute,
      Restypie.BasicRoutes.GetSingleRoute,
      Restypie.BasicRoutes.GetManyRoute,
      Restypie.BasicRoutes.PatchSingleRoute,
      Restypie.BasicRoutes.DeleteSingleRoute
    ];
  }
  get schema() {
    return {
      id: { type: 'int', isPrimaryKey: true },
      name: { type: String, isRequired: true, isFilterable: true },
      isAdmin: { type: Boolean, isWritable: true, isReadable: true, defaultValue: false }
    };
  }
}

describe.only('Restypie.Client', function () {

  before(function (done) {
    server = http.createServer(app);
    return server.listen(PORT, done);
  });

  before(function () {
    api.registerResource('Users', UsersResource).launch(app, { port: PORT });
  });

  beforeEach(function () {
    api.resources.Users.resetObjects();
  });

  describe('constructor', function () {

    it('should instantiate a new client', function () {
      let client = new Restypie.Client({ host: 'http://localhost:8888', version: 'v1', path: 'users' });
      client.url.should.equal('http://localhost:8888/v1/users');
    });

    it('should not instantiate a new client (missing host)', function () {
      (function () {
        new Restypie.Client({ version: 'v1', path: 'users' });
      }).should.throw(/host/);
    });

    it('should not instantiate a new client (missing path)', function () {
      (function () {
        new Restypie.Client({ version: 'v1', host: 'users' });
      }).should.throw(/path/);
    });

    it('should instantiate a new client without version', function () {
      let client = new Restypie.Client({ host: 'http://localhost:8888', path: 'users' });
      client.url.should.equal('http://localhost:8888/users');
    });
    
    it('should instantiate a new client with default headers', function () {
      const defaultHeaders = { 'x-custom-header': 'someValue' };
      const client = new Restypie.Client({ host: 'http://localhost:8888', path: 'users', defaultHeaders });
      client.defaultHeaders.should.deep.equal(defaultHeaders);
    });

  });

  describe('#create', function () {

    it('should create a user', function () {
      const client = new Restypie.Client({ host: 'http://localhost:' + PORT, version: 'v1', path: 'users' });
      return client.create({ name: 'John' }).then(function (created) {
        created.should.have.keys(['id', 'name']);
        created.name.should.equal('John');
      });
    });

    it('should create multiple users', function () {
      const client = new Restypie.Client({ host: 'http://localhost:' + PORT, version: 'v1', path: 'users' });
      return client.create([{ name: 'Jane' }, { name: 'Diane' }]).then(function (created) {
        created.should.have.lengthOf(2);
        should.exist(created.find((item) => item.name === 'Jane'));
        should.exist(created.find((item) => item.name === 'Diane'));
      });
    });

    it('should have sent default headers', function () {
      const defaultHeaders = { 'x-custom-header': 'someValue' };
      const client = new Restypie.Client({
        host: HOST,
        version: 'v1',
        path: 'users',
        defaultHeaders
      });
      nock(HOST)
        .matchHeader('x-custom-header', 'someValue')
        .post('/v1/users')
        .reply(Restypie.Codes.OK, { data: {} });
      return client.create({ name: 'John' }).then(() => {
        nock.cleanAll();
      });
    });

  });

  describe('#findById', function () {

    it('should retrieve a user by id', function () {
      const client = new Restypie.Client({ host: HOST, version: 'v1', path: 'users' });

      return client.create([
        { name: 'Jane' },
        { name: 'John' },
        { name: 'Diane' }
      ]).then((users) => {
        const original = users[0];
        return client.findById(original.id).then(function (user) {
          should.exist(user);
          user.id.should.equal(original.id);
          user.name.should.equal(original.name);
        });
      });
    });

    it('should send back a 404', function () {
      const client = new Restypie.Client({ host: HOST, version: 'v1', path: 'users' });
      return client.findById(999).then(function () {
        return Promise.reject(new Error('Should have thrown'));
      }, function (err) {
        should.exist(err);
        should.exist(err.statusCode);
        err.statusCode.should.equal(Restypie.Codes.NotFound);
      });
    });

    it('should have sent default headers', function () {
      const defaultHeaders = { 'x-custom-header': 'someValue' };
      const client = new Restypie.Client({ host: HOST, version: 'v1', path: 'users', defaultHeaders });
      nock(HOST)
        .matchHeader('x-custom-header', 'someValue')
        .get('/v1/users/1')
        .reply(Restypie.Codes.OK, { data: {} });
      return client.findById(1).then(() => {
        nock.cleanAll();
      });
    });

  });

  describe('#findOne', function () {

    it('should return the right user', function () {
      const client = new Restypie.Client({ host: HOST, version: 'v1', path: 'users' });
      return client.create([
        { name: 'Jane' },
        { name: 'John' },
        { name: 'Diane' }
      ]).then(function (users) {
        const original = users[0];
        return client.findOne({ name: original.name }).then(function (found) {
          found.id.should.equal(original.id);
          found.name.should.equal(original.name);
        });
      });
    });

    it('should return no user', function () {
      const client = new Restypie.Client({ host: HOST, version: 'v1', path: 'users' });
      return client.findOne({ name: 'foo' }).then(function (found) {
        should.not.exist(found);
      });
    });

    it('should have sent default headers', function () {
      const defaultHeaders = { 'x-custom-header': 'someValue' };
      const client = new Restypie.Client({ host: HOST, version: 'v1', path: 'users', defaultHeaders });
      nock(HOST)
        .matchHeader('x-custom-header', 'someValue')
        .get('/v1/users?name=foo&limit=1')
        .reply(Restypie.Codes.OK, { data: {} });
      return client.findOne({ name: 'foo' }).then(() => {
        nock.cleanAll();
      });
    });

  });

  describe('#find', function () {

    const usersData = [];
    _.times(100, (i) => usersData.push({ name: i.toString() }));

    it('should retrieve 20 users (default limit)', function () {
      const client = new Restypie.Client({ host: HOST, version: 'v1', path: 'users' });
      return client.create(usersData).then(() => {
        return client.find().then(function (users) {
          should.exist(users);
          users.should.have.lengthOf(20);
        });
      });
    });

    it('should retrieve 10 users (specified limit)', function () {
      const client = new Restypie.Client({ host: HOST, version: 'v1', path: 'users' });
      return client.create(usersData).then(() => {
        return client.find(null, { limit: 10 }).then(function (users) {
          should.exist(users);
          users.should.have.lengthOf(10);
        });
      });
    });

    it('should have sent default headers', function () {
      const defaultHeaders = { 'x-custom-header': 'someValue' };
      const client = new Restypie.Client({ host: HOST, version: 'v1', path: 'users', defaultHeaders });
      nock(HOST)
        .matchHeader('x-custom-header', 'someValue')
        .get('/v1/users')
        .reply(Restypie.Codes.OK, { data: {} });
      return client.find().then(() => {
        nock.cleanAll();
      });
    });

    it.skip('should retrieve all users (limit=0)', function () {
      return client.find({ limit: 0 }).then(function (users) {
        should.exist(users);
        users.should.have.lengthOf(users.length);
      });
    });

  });

  describe('#updateById', function () {

    it('should update a user', function () {
      const client = new Restypie.Client({ host: HOST, version: 'v1', path: 'users' });
      return client.create([
        { name: 'Jane' },
        { name: 'John' },
        { name: 'Diane' }
      ]).then((users) => {
        const original = users[0];
        return client.updateById(original.id, { name: 'foo' }).then((result) => {
          should.not.exist(result);
          return client.findById(original.id).then((user) => {
            user.name.should.equal('foo');
          });
        });
      });
    });

    it('should NOT update a user (isAdmin is not a boolean)', function () {
      const client = new Restypie.Client({ host: HOST, version: 'v1', path: 'users' });
      return client.updateById(1, { isAdmin: 'foo' }).then(() => {
        return Promise.reject(new Error('should have thrown'));
      }, function (err) {
        should.exist(err);
        err.statusCode.should.equal(Restypie.Codes.BadRequest);
      });
    });

    it('should send back a 404', function () {
      const client = new Restypie.Client({ host: HOST, version: 'v1', path: 'users' });
      return client.updateById(999, { name: 'foo' }).then(() => {
        return Promise.reject(new Error('should have thrown'));
      }).catch(function (err) {
        should.exist(err);
        err.statusCode.should.equal(Restypie.Codes.NotFound);
      });
    });

    it('should have sent default headers', function () {
      const defaultHeaders = { 'x-custom-header': 'someValue' };
      const client = new Restypie.Client({ host: HOST, version: 'v1', path: 'users', defaultHeaders });
      nock(HOST)
        .matchHeader('x-custom-header', 'someValue')
        .patch('/v1/users/1')
        .reply(Restypie.Codes.NoContent);
      return client.updateById(1, { name: 'foo' }).then(() => {
        nock.cleanAll();
      });
    });

  });

  describe('#deleteById', function () {

    it('should delete a user', function () {
      const client = new Restypie.Client({ host: HOST, version: 'v1', path: 'users' });

      return client.create([
        { name: 'Jane' },
        { name: 'John' },
        { name: 'Diane' }
      ]).then((users) => {
        const original = users[0];
        return client.deleteById(original.id).then(function (result) {
          should.not.exist(result);
          return client.findById(original.id).then(function () {
            return Promise.reject(new Error('User should not exist'));
          }).catch(function (err) {
            should.exist(err);
            err.statusCode.should.equal(Restypie.Codes.NotFound);
          });
        });
      });
    });

    it('should send back a 404', function () {
      const client = new Restypie.Client({ host: HOST, version: 'v1', path: 'users' });

      return client.deleteById(999).then(function () {
        return Promise.reject(new Error('User should not exist'));
      }, function (err) {
        should.exist(err);
        err.statusCode.should.equal(Restypie.Codes.NotFound);
        return Promise.resolve();
      });
    });

    it('should have sent default headers', function () {
      const defaultHeaders = { 'x-custom-header': 'someValue' };
      const client = new Restypie.Client({ host: HOST, version: 'v1', path: 'users', defaultHeaders });
      nock(HOST)
        .matchHeader('x-custom-header', 'someValue')
        .delete('/v1/users/1')
        .reply(Restypie.Codes.OK);
      return client.deleteById(1).then(() => {
        nock.cleanAll();
      });
    });

  });


});