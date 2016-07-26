'use strict';

module.exports = function (Fixtures) {

  describe('DELETE single', function () {

    it('should delete a user', function () {
      return Fixtures.generateUser().then((user) => {
        return Fixtures.deleteUser(user.theId).then(() => {
          return Fixtures.getUser(user.theId, { statusCode: Restypie.Codes.NotFound });
        });
      });
    });

    it('should send back a 404', function () {
      return Fixtures.deleteUser(123, { statusCode: Restypie.Codes.NotFound });
    });

    it('should not be able to parse the id', function () {
      return Fixtures.deleteUser('foo', { statusCode: Restypie.Codes.BadRequest }).then((body) => {
        body.error.should.equal(true);
        body.meta.should.should.be.an('object');
        body.meta.key.should.equal('theId');
      });
    });

  });

};