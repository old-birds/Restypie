'use strict';

let express = require('express');
let bodyParser = require('body-parser');
let http = require('http');
let _ = require('lodash');

const PORT = 9999;

let app = express();
let server;
app.set('port', PORT);
app.use(bodyParser.json());

let api = new Restypie.API({ path: 'v1' });

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

describe('Restypie.Client', function () {

  before(function (done) {
    server = http.createServer(app);
    return server.listen(PORT, done);
  });

  before(function () {
    api.registerResource('Users', UsersResource).launch(app, server);
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

  });

  describe('#create', function () {
    let client = new Restypie.Client({ host: 'http://localhost:' + PORT, version: 'v1', path: 'users' });

    it('should create a user', function () {
      return client.create({ name: 'John' }).then(function (created) {
        created.should.have.keys(['id', 'name']);
        created.name.should.equal('John');
        return Promise.resolve();
      });
    });

    it('should create multiple users', function () {
      return client.create([{ name: 'Jane' }, { name: 'Diane' }]).then(function (created) {
        created.should.have.lengthOf(2);
        should.exist(created.find((item) => item.name === 'Jane'));
        should.exist(created.find((item) => item.name === 'Diane'));
        return Promise.resolve();
      });
    });

  });

  describe('#findById', function () {
    let client = new Restypie.Client({ host: 'http://localhost:' + PORT, version: 'v1', path: 'users' });

    let users = [
      { name: 'Jane' },
      { name: 'John' },
      { name: 'Diane' }
    ];

    let usersById;

    it('Preparing tests...', function () {
      api.resources.Users.resetObjects();
      return client.create(users).then(function (created) {
        usersById = _.indexBy(created, 'id');
      });
    });

    it('should retrieve a user by id', function () {
      let original = usersById[Object.keys(usersById)[0]];
      return client.findById(original.id).then(function (user) {
        should.exist(user);
        user.id.should.equal(original.id);
        user.name.should.equal(original.name);
        return Promise.resolve();
      });
    });

    it('should send back a 404', function () {
      return client.findById(999).then(function () {
        return Promise.reject(new Error('Should have thrown'));
      }, function (err) {
        should.exist(err);
        should.exist(err.statusCode);
        err.statusCode.should.equal(Restypie.Codes.NotFound);
        return Promise.resolve();
      });
    });

  });

  describe('#findOne', function () {

    let client = new Restypie.Client({ host: 'http://localhost:' + PORT, version: 'v1', path: 'users' });

    let users = [
      { name: 'Jane' },
      { name: 'John' },
      { name: 'Diane' }
    ];

    let usersById;

    it('Preparing tests...', function () {
      api.resources.Users.resetObjects();
      return client.create(users).then(function (created) {
        usersById = _.indexBy(created, 'id');
      });
    });

    it('should return the right user', function () {
      let original = usersById[Object.keys(usersById)[1]];
      return client.findOne({ filters: { name: original.name } }).then(function (found) {
        found.id.should.equal(original.id);
        found.name.should.equal(original.name);
        return Promise.resolve();
      });
    });

    it('should return no user', function () {
      return client.findOne({ filters: { name: 'foo' } }).then(function (found) {
        should.not.exist(found);
        return Promise.resolve();
      });
    });

  });

  describe('#find', function () {

    let client = new Restypie.Client({ host: 'http://localhost:' + PORT, version: 'v1', path: 'users' });

    let users = [];
    _.times(100, (i) => users.push({ name: i.toString() }));

    let usersById;

    it('Preparing tests...', function () {
      api.resources.Users.resetObjects();
      return client.create(users).then(function (created) {
        usersById = _.indexBy(created, 'id');
      });
    });

    it('should retrieve 20 users (default limit)', function () {
      return client.find().then(function (users) {
        should.exist(users);
        users.should.have.lengthOf(20);
        return Promise.resolve();
      });
    });

    it('should retrieve 10 users (specified limit)', function () {
      return client.find({ limit: 10 }).then(function (users) {
        should.exist(users);
        users.should.have.lengthOf(10);
        return Promise.resolve();
      });
    });

    it('should retrieve all users (limit=0)', function () {
      return client.find({ limit: 0 }).then(function (users) {
        should.exist(users);
        users.should.have.lengthOf(users.length);
        return Promise.resolve();
      });
    });

  });

  describe('#updateById', function () {

    let client = new Restypie.Client({ host: 'http://localhost:' + PORT, version: 'v1', path: 'users' });

    let users = [
      { name: 'Jane' },
      { name: 'John' },
      { name: 'Diane' }
    ];

    let usersById;

    it('Preparing tests...', function () {
      api.resources.Users.resetObjects();
      return client.create(users).then(function (created) {
        usersById = _.indexBy(created, 'id');
      });
    });

    it('should update a user', function () {
      let original = usersById[Object.keys(usersById)[2]];
      return client.updateById(original.id, { name: 'foo' }).then(function (result) {
        should.not.exist(result);
        return client.findById(original.id).then(function (user) {
          user.name.should.equal('foo');
          return Promise.resolve();
        });
      });
    });

    it('should not update a user (isAdmin is not a boolean)', function () {
      let original = usersById[Object.keys(usersById)[2]];
      return client.updateById(original.id, { isAdmin: 'foo' }).then(function () {
        return Promise.reject(new Error('should have thrown'));
      }, function (err) {
        should.exist(err);
        err.statusCode.should.equal(Restypie.Codes.BadRequest);
        return Promise.resolve();
      });
    });

    it('should send back a 404', function () {
      return client.updateById(999).then(function () {
        return Promise.reject(new Error('should have thrown'));
      }).catch(function (err) {
        should.exist(err);
        err.statusCode.should.equal(Restypie.Codes.NotFound);
        return Promise.resolve();
      });
    });

  });

  describe('#deleteById', function () {

    let client = new Restypie.Client({ host: 'http://localhost:' + PORT, version: 'v1', path: 'users' });

    let users = [
      { name: 'Jane' },
      { name: 'John' },
      { name: 'Diane' }
    ];

    let usersById;

    it('Preparing tests...', function () {
      api.resources.Users.resetObjects();
      return client.create(users).then(function (created) {
        usersById = _.indexBy(created, 'id');
      });
    });

    it('should delete a user', function () {
      let original = usersById[Object.keys(usersById)[2]];
      return client.deleteById(original.id).then(function (result) {
        should.not.exist(result);
        return client.findById(original.id).then(function () {
          return Promise.reject(new Error('User should not exist'));
        }).catch(function (err) {
          should.exist(err);
          err.statusCode.should.equal(Restypie.Codes.NotFound);
          return Promise.resolve();
        });
      });
    });

    it('should send back a 404', function () {
      return client.deleteById(999).then(function () {
        return Promise.reject(new Error('User should not exist'));
      }, function (err) {
        should.exist(err);
        err.statusCode.should.equal(Restypie.Codes.NotFound);
        return Promise.resolve();
      });
    });


  });


});