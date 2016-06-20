'use strict';

let DateField = Restypie.Fields.DateField;


describe('Restypie.Fields.DateField', function () {

  it('should exist', function () {
    should.exist(DateField);
  });

  describe('constructor', function () {

    it('should accept the `ISOFormat` option', function () {
      let ISOFormat = /abc/;
      let field = new DateField('foo', { ISOFormat });
      field.ISOFormat.should.equal(ISOFormat);
    });

    it('should not accept the `ISOFormat` option', function () {
      let ISOFormat = 'abc';
      let field = new DateField('foo', { ISOFormat });
      field.ISOFormat.should.equal(DateField.DEFAULT_ISO_FORMAT);
    });

    it('should have correct min and max', function () {
      let min = new Date(Date.now() - 1000);
      let max = new Date(Date.now() + 1000);
      let field = new DateField('foo', { min, max });
      field.min.should.equal(+min);
      field.max.should.equal(+max);
    });

    it('should have default min and max', function () {
      let field = new DateField('foo');
      field.min.should.equal(DateField.MIN_TIMESTAMP);
      field.max.should.equal(DateField.MAX_TIMESTAMP);
    });

  });

  describe('.hydrate', function () {
    let field = new DateField('foo');

    it('should return a date from a date', function () {
      let date = new Date();
      field.hydrate(date).should.equal(date);
    });

    it('should return a date from an ISO string', function () {
      let date = new Date();
      field.hydrate(date.toISOString()).should.deep.equal(date);
    });

    it('should return a date from a timestamp', function () {
      let now = Date.now();
      field.hydrate(now).should.deep.equal(new Date(now));
    });

    it('should throw if ISO string is not valid (random string)', function () {
      (function () {
        field.hydrate('abc');
      }).should.throw(Restypie.TemplateErrors.BadType);
    });

    it('should throw if ISO string is not valid (partial ISO)', function () {
      (function () {
        field.hydrate(new Date().toISOString().substr(0, 10));
      }).should.throw(Restypie.TemplateErrors.BadType);
    });

  });

  describe('.validate', function () {
    let now = Date.now();
    let min = new Date(now - 1000);
    let max = new Date(now + 1000);
    let field = new DateField('foo', { min, max });

    it('should validate the value', function () {
      field.validate(new Date(now));
    });

    it('should should throw if value is greater than max', function () {
      (function () {
        field.validate(new Date(now + 2000));
      }).should.throw(Restypie.TemplateErrors.OutOfRange);
    });

    it('should should throw if value is smaller than min', function () {
      (function () {
        field.validate(new Date(now - 2000));
      }).should.throw(Restypie.TemplateErrors.OutOfRange);
    });

  });

  describe('.dehydrate', function () {
    let field = new DateField('foo');

    it('should return an ISO string from a date', function () {
      let date = new Date();
      field.dehydrate(date).should.equal(date.toISOString());
    });

    it('should return an ISO string from a timestamp', function () {
      let now = Date.now();
      field.dehydrate(now).should.equal(new Date(now).toISOString());
    });

    it('should not dehydrate a missing value', function () {
      (field.dehydrate() === undefined).should.equal(true);
      (field.dehydrate(null) === null).should.equal(true);
    });

  });

});