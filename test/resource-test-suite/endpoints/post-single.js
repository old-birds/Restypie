'use strict';

const Path = require('path');
const Restypie = require('../../../');
const Utils = require('../utils');

module.exports = function(supertest, app, api) {
  
  describe('POST single', function () {
    
    it('should create a user (no profile picture)', function (done) {
      let user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        yearOfBirth: 1986,
        password: 'Passw0rd',
        hasSubscribedEmails: true,
        gender: 'male'
      };

      return supertest(app)
        .post('/v1/users')
        .send(user)
        .expect(Restypie.Codes.Created, function (err, res) {
          if (err) return done(err);
          let stored = res.body.data;
          should.exist(stored);
          stored.theId.should.be.a('number');
          stored.firstName.should.equal(user.firstName);
          stored.lastName.should.equal(user.lastName);
          stored.yearOfBirth.should.equal(user.yearOfBirth);
          stored.luckyNumber.should.equal(7);
          should.not.exist(stored.password);
          return done();
        });

    });

    it('should create a user (with a profile picture)', function (done) {
      let user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe2@example.com',
        yearOfBirth: 1986,
        password: 'Passw0rd',
        hasSubscribedEmails: false,
        gender: 'male'
      };

      let req = supertest(app).post('/v1/users');

      Utils.fillMultipartFields(req, user);

      return req
        .attach('profilePicture', Path.resolve(__dirname, '../fixtures/profile-picture.png'))
        .expect(Restypie.Codes.Created, function (err, res) {
          if (err) return done(err);
          let stored = res.body.data;
          should.exist(stored);
          stored.theId.should.be.a('number');
          stored.firstName.should.equal(user.firstName);
          stored.lastName.should.equal(user.lastName);
          stored.yearOfBirth.should.equal(user.yearOfBirth);
          stored.profilePicture.should.be.a('string');
          stored.hasSubscribedEmails.should.be.a('boolean');
          should.not.exist(stored.password);
          return done();
        });
    });

    it('should not create a user (missing firstName)', function (done) {
      let user = {
        lastName: 'Doe',
        yearOfBirth: 1986,
        email: 'john.doe3@example.com',
        password: 'Passw0rd',
        hasSubscribedEmails: true,
        gender: 'male'
      };

      return supertest(app)
        .post('/v1/users')
        .send(user)
        .expect(Restypie.Codes.BadRequest, function (err, res) {
          if (err) return done(err);
          let body = res.body;
          body.error.should.equal(true);
          body.message.should.be.a('string');
          body.code.should.be.a('string');
          body.meta.should.be.an('object');
          body.meta.key.should.equal('firstName');
          return done();
        });
    });

    it('should not create a user (yearOfBirth is not an integer)', function (done) {
      let user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe4@example.com',
        yearOfBirth: 'abc',
        password: 'Passw0rd',
        hasSubscribedEmails: true,
        gender: 'male'
      };

      return supertest(app)
        .post('/v1/users')
        .send(user)
        .expect(Restypie.Codes.BadRequest, function (err, res) {
          if (err) return done(err);
          let body = res.body;
          body.error.should.equal(true);
          body.message.should.be.a('string');
          body.code.should.be.a('string');
          body.meta.should.be.an('object');
          body.meta.key.should.equal('yearOfBirth');
          return done();
        });
    });

    it('should not create a user (password is not strong enough)', function (done) {
      let user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe5@example.com',
        yearOfBirth: 1986,
        password: 'passw0rd',
        hasSubscribedEmails: true,
        gender: 'male'
      };

      return supertest(app)
        .post('/v1/users')
        .send(user)
        .expect(Restypie.Codes.BadRequest, function (err, res) {
          if (err) return done(err);
          let body = res.body;
          body.error.should.equal(true);
          body.message.should.be.a('string');
          body.code.should.be.a('string');
          body.meta.should.be.an('object');
          body.meta.key.should.equal('password');
          return done();
        });
    });

    it('should not create a user (yearOfBirth is out of range)', function (done) {
      let user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe6@example.com',
        yearOfBirth: 1000,
        password: 'Passw0rd',
        hasSubscribedEmails: true,
        gender: 'male'
      };

      return supertest(app)
        .post('/v1/users')
        .send(user)
        .expect(Restypie.Codes.Forbidden, function (err, res) {
          if (err) return done(err);
          let body = res.body;
          body.error.should.equal(true);
          body.message.should.be.a('string');
          body.code.should.be.a('string');
          body.meta.should.be.an('object');
          body.meta.key.should.equal('yearOfBirth');
          return done();
        });
    });

    it('should not create a user (profile picture is too large)', function (done) {
      let user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe7@example.com',
        yearOfBirth: 1986,
        password: 'Passw0rd',
        hasSubscribedEmails: true,
        gender: 'male'
      };

      let req = supertest(app).post('/v1/users');
      Utils.fillMultipartFields(req, user);

      return req
        .attach('profilePicture', Path.resolve(__dirname, '../fixtures/big-profile-picture.jpg'))
        .expect(Restypie.Codes.Forbidden, function (err, res) {
          if (err) return done(err);
          let body = res.body;
          body.error.should.equal(true);
          body.message.should.be.a('string');
          body.code.should.be.a('string');
          body.meta.should.be.an('object');
          body.meta.key.should.equal('profilePicture');
          return done();
        });
    });

    it('should not create a user (readOnly cannot be written)', function (done) {
      let user = {
        theId: 1,
        readOnly: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe8@example.com',
        yearOfBirth: 1987,
        password: 'Passw0rd',
        hasSubscribedEmails: true,
        gender: 'male'
      };

      return supertest(app)
        .post('/v1/users')
        .send(user)
        .expect(Restypie.Codes.Forbidden, function (err, res) {
          if (err) return done(err);
          let body = res.body;
          body.error.should.equal(true);
          body.message.should.be.a('string');
          body.code.should.be.a('string');
          body.meta.should.be.an('object');
          body.meta.key.should.equal('readOnly');
          return done();
        });
    });

    it('should not create a user (duplicate email)', function (done) {
      if (!api.resources.users.supportsUniqueConstraints) return this.skip();

      let user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        yearOfBirth: 1986,
        password: 'Passw0rd',
        hasSubscribedEmails: true,
        gender: 'male'
      };

      return supertest(app)
        .post('/v1/users')
        .send(user)
        .expect(Restypie.Codes.Created, function (err) {
          if (err) return done(err);

          return supertest(app)
            .post('/v1/users')
            .send(user)
            .expect(Restypie.Codes.Conflict, function (err, res) {
              if (err) return done(err);
              let body = res.body;
              body.error.should.equal(true);
              body.message.should.be.a('string');
              body.code.should.be.a('string');
              body.meta.should.be.an('object');
              body.meta.keys.should.deep.equal({ email: 'john.doe@example.com' });
              return done();
            });
        });

    });
  });
  
};