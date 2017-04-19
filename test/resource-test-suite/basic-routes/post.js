'use strict';

const Path = require('path');

const Restypie = require('../../../');

module.exports = function(Fixtures, api) {

  describe('POST single', function () {

    it('should create a user (no profile picture)', function () {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        yearOfBirth: 1986,
        password: 'Passw0rd',
        hasSubscribedEmails: true,
        gender: 'male'
      };

      return Fixtures.createUser(data).then((user) => {
        should.exist(user);
        user.theId.should.be.a('number');
        user.firstName.should.equal(data.firstName);
        user.lastName.should.equal(data.lastName);
        user.yearOfBirth.should.equal(data.yearOfBirth);
        user.luckyNumber.should.equal(7);
        should.not.exist(user.password);
      });
    });

    it('should create a user (with a profile picture)', function () {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe2@example.com',
        yearOfBirth: 1986,
        password: 'Passw0rd',
        hasSubscribedEmails: false,
        gender: 'male'
      };

      return Fixtures.createUser(data, {
        attach: { profilePicture: Path.resolve(__dirname, '../fixtures/profile-picture.png') }
      }).then((user) => {
        should.exist(user);
        user.theId.should.be.a('number');
        user.firstName.should.equal(data.firstName);
        user.lastName.should.equal(data.lastName);
        user.yearOfBirth.should.equal(data.yearOfBirth);
        user.profilePicture.should.be.a('string');
        user.hasSubscribedEmails.should.be.a('boolean');
        should.not.exist(user.password);
      });
    });

    it('should NOT create a user (missing firstName)', function () {
      return Fixtures.createUser({
        lastName: 'Doe',
        yearOfBirth: 1986,
        email: 'john.doe3@example.com',
        password: 'Passw0rd',
        hasSubscribedEmails: true,
        gender: 'male'
      }, {
        statusCode: Restypie.Codes.BadRequest
      }).then((body) => {
        body.error.should.equal(true);
        body.message.should.be.a('string');
        body.code.should.be.a('string');
        body.meta.should.be.an('object');
        body.meta.key.should.equal('firstName');
      });
    });

    it('should NOT create a user (yearOfBirth is not an integer)', function () {
      return Fixtures.createUser({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe4@example.com',
        yearOfBirth: 'abc',
        password: 'Passw0rd',
        hasSubscribedEmails: true,
        gender: 'male'
      }, {
        statusCode: Restypie.Codes.BadRequest
      }).then((body) => {
        body.error.should.equal(true);
        body.message.should.be.a('string');
        body.code.should.be.a('string');
        body.meta.should.be.an('object');
        body.meta.key.should.equal('yearOfBirth');
      });
    });

    it('should NOT create a user (password is not strong enough)', function () {
      return Fixtures.createUser({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe5@example.com',
        yearOfBirth: 1986,
        password: 'passw0rd',
        hasSubscribedEmails: true,
        gender: 'male'
      }, {
        statusCode: Restypie.Codes.BadRequest
      }).then((body) => {
        body.error.should.equal(true);
        body.message.should.be.a('string');
        body.code.should.be.a('string');
        body.meta.should.be.an('object');
        body.meta.key.should.equal('password');
      });
    });

    it('should NOT create a user (yearOfBirth is out of range)', function () {
      return Fixtures.createUser({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe6@example.com',
        yearOfBirth: 1000,
        password: 'Passw0rd',
        hasSubscribedEmails: true,
        gender: 'male'
      }, {
        statusCode: Restypie.Codes.Forbidden
      }).then((body) => {
        body.error.should.equal(true);
        body.message.should.be.a('string');
        body.code.should.be.a('string');
        body.meta.should.be.an('object');
        body.meta.key.should.equal('yearOfBirth');
      });
    });

    it('should NOT create a user (profile picture is too large)', function () {
      return Fixtures.createUser({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe7@example.com',
        yearOfBirth: 1986,
        password: 'Passw0rd',
        hasSubscribedEmails: true,
        gender: 'male'
      }, {
        statusCode: Restypie.Codes.Forbidden,
        attach: { profilePicture: Path.resolve(__dirname, '../fixtures/big-profile-picture.jpg') }
      }).then((body) => {
        body.error.should.equal(true);
        body.message.should.be.a('string');
        body.code.should.be.a('string');
        body.meta.should.be.an('object');
        body.meta.key.should.equal('profilePicture');
      });
    });

    it('should NOT create a user (readOnly cannot be written)', function () {
      return Fixtures.createUser({
        theId: 1,
        readOnly: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe8@example.com',
        yearOfBirth: 1987,
        password: 'Passw0rd',
        hasSubscribedEmails: true,
        gender: 'male'
      }, {
        statusCode: Restypie.Codes.Forbidden
      }).then((body) => {
        body.error.should.equal(true);
        body.message.should.be.a('string');
        body.code.should.be.a('string');
        body.meta.should.be.an('object');
        body.meta.key.should.equal('readOnly');
      });
    });

    it('should NOT create a user (duplicate email)', function () {
      if (!api.resources.users.supportsUniqueConstraints) return this.skip();

      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        yearOfBirth: 1986,
        password: 'Passw0rd',
        hasSubscribedEmails: true,
        gender: 'male'
      };

      return Fixtures.createUser(data).then(() => { // First one should be created
        return Fixtures.createUser(data, { statusCode: Restypie.Codes.Conflict }); // Second one should not
      }).then((body) => {
        body.error.should.equal(true);
        body.message.should.be.a('string');
        body.code.should.be.a('string');
        body.meta.should.be.an('object');
        body.meta.keys.should.deep.equal({ email: 'john.doe@example.com' });
      });
    });

    it('should create a user (with protected field)', function () {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        internalName: 'john_doe',
        email: 'john.doe@example.com',
        yearOfBirth: 1986,
        password: 'Passw0rd',
        hasSubscribedEmails: true,
        gender: 'male'
      };

      return Fixtures.createUser(data, { setSudoHeader: true }).then((user) => {
        should.exist(user);
        user.theId.should.be.a('number');
        user.firstName.should.equal(data.firstName);
        user.lastName.should.equal(data.lastName);
        user.yearOfBirth.should.equal(data.yearOfBirth);
        user.hasSubscribedEmails.should.be.a('boolean');
        should.not.exist(user.password);
      });
    });

    it('should NOT create a user (missing internal name auth)', function () {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        internalName: 'john_doe',
        email: 'john.doe@example.com',
        yearOfBirth: 1986,
        password: 'Passw0rd',
        hasSubscribedEmails: true,
        gender: 'male'
      };

      return Fixtures.createUser(data, { statusCode: Restypie.Codes.Unauthorized }).then((body) => {
        body.error.should.equal(true);
        body.message.should.be.a('string');
        body.code.should.be.a('string');
        body.meta.should.be.an('object');
        body.meta.key.should.equal('internalName');
      });
    });

    it('should create multiple users with correct permissions', function () {
      const data = [{
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        yearOfBirth: 1986,
        password: 'Passw0rd',
        hasSubscribedEmails: true,
        gender: 'male'
      }, {
        firstName: 'Jane',
        lastName: 'Doe',
        internalName: 'jane_doe',
        email: 'jane.doe@example.com',
        yearOfBirth: 1988,
        password: 'Passw0rd',
        hasSubscribedEmails: true,
        gender: 'female',
        luckyNumber: '9'
      }];

      return Fixtures.createUsers(data, { setSudoHeader: true }).then((users) => {
        should.exist(users);
        users.should.be.an('array').and.have.lengthOf(2);
        users.forEach(user => user.theId.should.be.a('number'));
      });
    });

    it('should NOT create multiple users due to missing permissions', function () {
      const data = [{
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        yearOfBirth: 1986,
        password: 'Passw0rd',
        hasSubscribedEmails: true,
        gender: 'male'
      }, {
        firstName: 'Jane',
        lastName: 'Doe',
        internalName: 'jane_doe',
        email: 'jane.doe@example.com',
        yearOfBirth: 1988,
        password: 'Passw0rd',
        hasSubscribedEmails: true,
        gender: 'female',
        luckyNumber: '9'
      }];

      return Fixtures.createUsers(data, { statusCode: Restypie.Codes.Unauthorized }).then((body) => {
        should.exist(body);
        body.error.should.equal(true);
        body.message.should.be.a('string');
        body.code.should.be.a('string');
        body.meta.should.be.an('object');
        body.meta.key.should.equal('internalName');
      });
    });

    it('should create multiple users (no profile picture)', function () {
      const data = [{
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        yearOfBirth: 1986,
        password: 'Passw0rd',
        hasSubscribedEmails: true,
        gender: 'male'
      }, {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        yearOfBirth: 1988,
        password: 'Passw0rd',
        hasSubscribedEmails: true,
        gender: 'female'
      }];

      return Fixtures.createUsers(data).then((users) => {
        should.exist(users);
        users.should.be.an('array').and.have.lengthOf(2);
        users.forEach(user => user.theId.should.be.a('number'));
      });
    });
  });

};
