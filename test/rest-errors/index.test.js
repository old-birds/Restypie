'use strict';

describe('Restypie.RestErrors', function () {

  describe('constructor', function () {

    it('should call getters...', function () {
      Restypie.RestErrors.Forbidden;
      Restypie.RestErrors.NotImplemented;
      Restypie.RestErrors.UnsupportedMediaType;
      Restypie.RestErrors.NotAcceptable;
      Restypie.RestErrors.BadRequest;
      Restypie.RestErrors.NotFound;
      Restypie.RestErrors.Unauthorized;
      Restypie.RestErrors.ServiceUnavailable;
      Restypie.RestErrors.GatewayTimeOut;
    });

  });

  describe('.toRestError()', function () {
    it('should return the error itself if its already a RestError', function () {
      const err = new Restypie.RestErrors.Forbidden('');
      Restypie.RestErrors.toRestError(err).should.equal(err);
    });

    it('should transform regular error to a RestError and preserve the stack and message', function () {
      const regular = new Error('Something went wrong');
      const converted = Restypie.RestErrors.toRestError(regular);
      converted.should.be.an.instanceOf(Restypie.RestErrors.AbstractRestError);
      converted.message.should.equal(regular.message);
      converted.stack.should.equal(regular.stack);
    });
  });

  describe('.fromStatusCode()', function () {
    it('should map 404 to a NotFound error', function () {
      const err = Restypie.RestErrors.fromStatusCode(404, 'notfound', { foo: 'bar' });
      err.should.be.an.instanceOf(Restypie.RestErrors.NotFound);
      err.message.should.equal('notfound');
      err.meta.should.deep.equal({ foo: 'bar' });
    });
    it('should map to InternalServerError if no corresponding error exists', function () {
      const err = Restypie.RestErrors.fromStatusCode(600, 'random', { foo: 'bar' }); // Oh yeah, 600
      err.should.be.an.instanceOf(Restypie.RestErrors.InternalServerError);
      err.message.should.equal('random');
      err.meta.should.deep.equal({ foo: 'bar' });
    });
  });

});
