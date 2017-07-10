'use strict';

const Sequelize = require('sequelize');
const express = require('express');
const http = require('http');

const db = new Sequelize('restypie_test', 'root', '', {
  host: 'localhost',
  dialect: 'mariadb',
  logging: false
});

const User = db.define('User', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true,
    unique: true,
    autoIncrement: true
  },
  fName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  lName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  iName: {
    type: Sequelize.STRING,
    allowNull: true
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  job: {
    type: Sequelize.INTEGER
  },
  year: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: {
      min: 1900,
      max: new Date().getFullYear()
    }
  },
  emails: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  },
  pw: {
    type: Sequelize.STRING
  },
  pic: {
    type: Sequelize.STRING
  },
  createdOn: {
    type: Sequelize.DATE
  },
  gender: {
    type: Sequelize.ENUM('male', 'female')
  },
  luckyNumber: {
    type: Sequelize.INTEGER
  },
  readOnly: {
    type: Sequelize.INTEGER
  }
}, {
  tableName: 'users',
  updatedAt: 'updatedOn',
  createdAt: 'createdOn'
});

describe('Resources.SequelizeResource', function () {

  class SequelizeResource extends Restypie.Resources.SequelizeResource {
    get model() { return User; }
  }

  const before = function () {
    return User.sync({ force: true });
  };

  describe('Using Express', function () {
    require('../../resource-test-suite')({
      before,
      routerType: Restypie.RouterTypes.EXPRESS,
      resource: SequelizeResource
    });
  });

  describe('Using Koa-Router', function () {
    require('../../resource-test-suite')({
      before,
      routerType: Restypie.RouterTypes.KOA_ROUTER,
      resource: SequelizeResource
    });
  });

  describe('Own tests', function () {

    const app = express();
    const api = new Restypie.API({ path: 'v1', routerType: Restypie.RouterTypes.EXPRESS });
    const PORT = 8333;
    const server = http.createServer(app);

    const UsersResource = require('../../resource-test-suite/resources/users')({
      api,
      resource: SequelizeResource
    });

    api
      .registerResources({ users: UsersResource })
      .launch(app, { port: PORT });



    before(function (cb) {
      return server.listen(PORT, cb);
    });

    it('should map min validation error', function () {
      return api.resources.users.createObject({
        body: {
          fName : 'Sequelize',
          lName : 'Sequelize',
          email : 'sequelizewrongdate@example.com',
          year  : 1850, // Too small
          pw    : 'Passw0rd',
          emails: true,
          gender: 'male'
        }
      }).catch(function (err) {
        err.code.should.equal('OutOfRangeError');
        err.meta.key.should.equal('yearOfBirth');
        return Promise.resolve();
      });
    });

    it('should map max validation error', function () {
      return api.resources.users.createObject({
        body: {
          fName : 'Sequelize',
          lName : 'Sequelize',
          email : 'sequelizewrongdate@example.com',
          year  : new Date().getFullYear() + 10, // Too big
          pw    : 'Passw0rd',
          emails: true,
          gender: 'male'
        }
      }).catch(function (err) {
        err.code.should.equal('OutOfRangeError');
        err.meta.key.should.equal('yearOfBirth');
        return Promise.resolve();
      });
    });

  });

});
