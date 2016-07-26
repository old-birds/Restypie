'use strict';

const Path = require('path');

module.exports = function (Fixtures) {
  
  describe('PATCH single', function () {

    it('should update a user (no profile picture)', function () {
      return Fixtures.generateUser().then((user) => {
        const updates = { firstName: 'JohnTheFirst', yearOfBirth: 1987 };
        return Fixtures.updateUser(user.theId, updates, { return: true }).then((updated) => {
          updated.firstName.should.equal(updates.firstName);
          updated.yearOfBirth.should.equal(updates.yearOfBirth);
        });
      });
    });

    it('should update a user (with profile picture)', function () {
      return Fixtures.generateUser().then((user) => {
        should.not.exist(user.profilePicture);
        const update = { firstName: 'JohnTheSecond' };
        return Fixtures.updateUser(user.theId, update, {
          return: true,
          attach: { profilePicture: Path.resolve(__dirname, '../fixtures/profile-picture.png') }
        }).then((updated) => {
          updated.firstName.should.equal(update.firstName);
          updated.profilePicture.should.be.a('string');
        });
      });
    });

    it('should not update a user (password can only be written once)', function () {
      return Fixtures.generateUser().then((user) => {
        return Fixtures.updateUser(user.theId, { password: 'Passw0rd123' }, {
          statusCode: Restypie.Codes.Forbidden
        }).then((body) => {
          body.error.should.equal(true);
          body.meta.should.be.an('object');
          body.meta.key.should.equal('password');
        });
      });
    });

    it('should not update a user (yearOfBirth is out of range)', function () {
      return Fixtures.generateUser().then((user) => {
        return Fixtures.updateUser(user.theId, { yearOfBirth: 1000 }, {
          statusCode: Restypie.Codes.Forbidden
        }).then((body) => {
          body.error.should.equal(true);
          body.meta.should.be.an('object');
          body.meta.key.should.equal('yearOfBirth');
        });
      });
    });

    it('should not update a user (hasSubscribedEmails is not a boolean)', function () {
      return Fixtures.generateUser().then((user) => {
        return Fixtures.updateUser(user.theId, { hasSubscribedEmails: 1000 }, {
          statusCode: Restypie.Codes.BadRequest
        }).then((body) => {
          body.error.should.equal(true);
          body.meta.should.be.an('object');
          body.meta.key.should.equal('hasSubscribedEmails');
        });
      });
    });

    it('should send back a 404', function () {
      return Fixtures.updateUser(123, {}, { statusCode: Restypie.Codes.NotFound });
    });

  });
  
};