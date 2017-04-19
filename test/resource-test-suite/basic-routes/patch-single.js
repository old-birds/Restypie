'use strict';

const Path = require('path');

const Restypie = require('../../../');

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

    it('should updated fields if authorized for update', function () {
      const updates = { internalName: `john-doe` };
      return Fixtures.generateUser({ internalName: `john_doe` }, { setSudoHeader: true }).then((user) => {
        return Fixtures.updateUser(user.theId, updates, { setSudoHeader: true, return: true});
      }).then((user) => {
        user.should.be.an('object');
        return Fixtures.getUser(user.theId, { select: ['theId', 'internalName'], setSudoHeader: true });
      }).then((user) => {
        user.internalName.should.equal(updates.internalName);
      });
    });

    it('should NOT update if missing update permissions', function () {
      return Fixtures.generateUser({ internalName: `john_doe` }, { setSudoHeader: true }).then((user) => {
        return Fixtures.updateUser(user.theId, { internalName: 'hacker' }, { statusCode: Restypie.Codes.Unauthorized });
      }).then((body) => {
        body.error.should.equal(true);
        body.message.should.be.a('string');
        body.code.should.be.a('string');
        body.meta.should.be.an('object');
        body.meta.key.should.equal('internalName');
      });
    });

  });

};
