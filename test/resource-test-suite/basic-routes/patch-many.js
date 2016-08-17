'use strict';

const Path = require('path');

const Restypie = require('../../../');

module.exports = function (Fixtures) {

  describe('PATCH many', function () {

    it('should update users (no profile picture)', function () {
      const updatedCount = 3;

      return Fixtures.generateUsers(5, (index) => {
        return { yearOfBirth: index > 1 ? 1950 + index : 1950 };
      }).then(() => {
        const filters = { yearOfBirth: { gt: 1950 } };
        const updates = { firstName: 'Updated', yearOfBirth: 1930 };

        return Fixtures.getUsers(filters).then((preMatch) => {
          preMatch.should.have.lengthOf(updatedCount);
          return Fixtures.updateUsers(filters, updates, { return: true }).then((updated) => {
            updated.should.have.lengthOf(updatedCount);
            updated.forEach((user) => {
              user.firstName.should.equal(updates.firstName);
              user.yearOfBirth.should.equal(updates.yearOfBirth);
            });
            return Fixtures.getUsers(filters).then((postMatch) => {
              postMatch.should.have.lengthOf(0);
            });
          });
        });
      });
    });

    it('should update users (with profile picture)', function () {
      const updatedCount = 3;

      return Fixtures.generateUsers(5, (index) => {
        return { yearOfBirth: index > 1 ? 1950 + index : 1950, profilePicture: null };
      }).then(() => {
        const filters = { yearOfBirth: { gt: 1950 } };
        const updates = { firstName: 'Updated with picture' };

        return Fixtures.getUsers(filters).then((preMatch) => {
          preMatch.should.have.lengthOf(updatedCount);
          return Fixtures.updateUsers(filters, updates, {
            attach: { profilePicture: Path.resolve(__dirname, '../fixtures/profile-picture.png') },
            return: true
          }).then((updated) => {
            updated.should.have.lengthOf(updatedCount);
            updated.forEach((user) => {
              user.firstName.should.equal(updates.firstName);
              user.profilePicture.should.be.a('string');
            });
          });
        });
      });
    });

    it('should NOT update users (password can only be written once)', function () {
      const update = { password: 'Passw0rd123' };
      return Fixtures.updateUsers({ yearOfBirth: { gte: 0 } }, update, {
        statusCode: Restypie.Codes.Forbidden
      }).then((body) => {
        body.error.should.equal(true);
        body.meta.should.be.an('object');
        body.meta.key.should.equal('password');
      });
    });

    it('should NOT update users (yearOfBirth is out of range)', function () {
      const update = { yearOfBirth: 1000 };
      const filters = { yearOfBirth: { gte: 0 } };
      return Fixtures.updateUsers(filters, update, {
        statusCode: Restypie.Codes.Forbidden
      }).then((body) => {
        body.error.should.equal(true);
        body.meta.should.be.an('object');
        body.meta.key.should.equal('yearOfBirth');
      });
    });

    it('should NOT update users (hasSubscribedEmails is not a boolean)', function () {
      const update = { hasSubscribedEmails: 1000 };
      const filters = { yearOfBirth: { gt: 0 } };
      return Fixtures.updateUsers(filters, update, {
        statusCode: Restypie.Codes.BadRequest
      }).then((body) => {
        body.error.should.equal(true);
        body.meta.should.be.an('object');
        body.meta.key.should.equal('hasSubscribedEmails');
      });
    });

    it('should reject the request if no filters', function () {
      return Fixtures.updateUsers({}, { hasSubscribedEmails: true }, {
        statusCode: Restypie.Codes.Forbidden
      }).then((body) => {
        body.error.should.equal(true);
        body.code.should.equal('RequestOutOfRangeError');
      });
    });

  });

};