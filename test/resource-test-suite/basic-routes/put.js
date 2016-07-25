'use strict';

module.exports = function (Fixtures, api) {

  describe('PUT', function () {

    it('should create a user', function () {
      if (!api.resources.users.supportsUpserts) return this.skip();

      const filters = { email: 'john.doe@example.com' };
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        yearOfBirth: 1986,
        password: 'Passw0rd',
        job: 1,
        hasSubscribedEmails: true,
        gender: 'male'
      };

      return Fixtures.upsertUser(filters, data, {
        statusCode: Restypie.Codes.Created
      }).then((upserted) => {
        upserted.email.should.equal(filters.email);
        upserted.firstName.should.equal(data.firstName);
        upserted.yearOfBirth.should.equal(data.yearOfBirth);
        upserted.lastName.should.equal(data.lastName);
        upserted.job.should.equal(data.job);
        upserted.hasSubscribedEmails.should.equal(data.hasSubscribedEmails);
        upserted.gender.should.equal(data.gender);
      });
    });

    it('should update the created user', function () {
      if (!api.resources.users.supportsUpserts) return this.skip();

      const data = {
        firstName: 'John',
        lastName: 'Doe',
        yearOfBirth: 1986,
        password: 'Passw0rd',
        job: 1,
        hasSubscribedEmails: true,
        gender: 'male'
      };

      return Fixtures.generateUser().then((user) => {
        return Fixtures.upsertUser({ email: user.email }, data, {
          statusCode: Restypie.Codes.OK
        }).then((upserted) => {
          upserted.email.should.equal(user.email);
          upserted.firstName.should.equal(data.firstName);
          upserted.yearOfBirth.should.equal(data.yearOfBirth);
          upserted.lastName.should.equal(data.lastName);
          upserted.job.should.equal(data.job);
          upserted.hasSubscribedEmails.should.equal(data.hasSubscribedEmails);
          upserted.gender.should.equal(data.gender);
        });
      });
    });

    it('should NOT create a user (no upsert keys)', function () {
      if (!api.resources.users.supportsUpserts) return this.skip();

      return Fixtures.upsertUser({ firstName: 'John' }, {
        email: 'john2.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        yearOfBirth: 1986,
        password: 'Passw0rd',
        job: 1,
        hasSubscribedEmails: true,
        gender: 'male'
      }, {
        statusCode: Restypie.Codes.Forbidden
      });
    });
  });


};