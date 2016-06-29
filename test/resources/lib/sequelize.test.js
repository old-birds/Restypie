'use strict';

const Sequelize = require('sequelize');
const _ = require('lodash');

let db = new Sequelize('restypie_test', 'root', '', {
  host: 'localhost',
  dialect: 'mariadb',
  logging: false
});

let User = db.define('User', {
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

  for (const routerType of _.values(Restypie.ROUTER_TYPES)) {

    before(function () {
      Restypie.setRouterType(routerType);
    });

    before(function () {
      return User.sync({force: true});
    });

    let testData;


    testData = require('../../resource-test-suite')({
      resource: class UsersResource extends Restypie.Resources.SequelizeResource {
        get model() {
          return User;
        }
      }
    });

    it('should map min validation error', function () {
      return testData.api.resources.Users.createObject({
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

    it('should map min validation error', function () {
      return testData.api.resources.Users.createObject({
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
  }
});