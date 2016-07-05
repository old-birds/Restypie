'use strict';

describe('Restypie.TemplateErrors', function () {

  describe('AbstractError', function () {

    describe('constructor', function () {

      it('should not instantiate abstract class', function () {
        (function () {
          new Restypie.TemplateErrors.AbstractError();
        }).should.throw(/abstract/);
      });

      it('should instantiate an error', function () {
        class TemplateError extends Restypie.TemplateErrors.AbstractError {
          get statusCode() { return Restypie.Codes.BadRequest; }
        }
        const err = new TemplateError({ foo: 'bar' });
        err.meta.should.deep.equal({ foo: 'bar' });
        err.name.should.equal('TemplateError');
        err.message.should.equal('{"foo":"bar"}');
        err.statusCode.should.equal(Restypie.Codes.BadRequest);
      });

      it('should instantiate an error using a message', function () {
        class TemplateError extends Restypie.TemplateErrors.AbstractError {
          get statusCode() { return Restypie.Codes.BadRequest; }
        }
        const err = new TemplateError('test');
        err.name.should.equal('TemplateError');
        err.message.should.equal('test');
        err.statusCode.should.equal(Restypie.Codes.BadRequest);
      });

      it('should throw an error if no status code', function () {
        class TemplateError extends Restypie.TemplateErrors.AbstractError {
          // Omitting statusCode
        }
        (function () {
          new TemplateError('test');
        }).should.throw(/statusCode/);
      });

    });

  });

  describe('.overrideTemplate()', function () {
    it('should override the template', function () {
      Restypie.TemplateErrors.overrideTemplate(Restypie.TemplateErrors.Missing, function () {
        return 'overridden';
      });
      const err = new Restypie.TemplateErrors.Missing({});
      err.message.should.equal('overridden');
    });
  });


});