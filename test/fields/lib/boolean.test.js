'use strict';

let BooleanField = Restypie.Fields.BooleanField;


describe('Restypie.Fields.BooleanField', function () {

  it('should exist', function () {
    should.exist(BooleanField);
  });

  describe('.hydrate', function () {

    let field = new BooleanField('foo');

    it('should return true for `"true"`', function () {
      field.hydrate('true').should.equal(true);
    });

    it('should return true for `true`', function () {
      field.hydrate(true).should.equal(true);
    });

    it('should return false for `"false"`', function () {
      field.hydrate('false').should.equal(false);
    });

    it('should return false for `false`', function () {
      field.hydrate(false).should.equal(false);
    });

    it('should throw if value is not `true`, `false`, `"true"` or `"false"`', function () {
      (function () { field.hydrate('foo'); }).should.throw(Restypie.TemplateErrors.BadType);
      (function () { field.hydrate(4); }).should.throw(Restypie.TemplateErrors.BadType);
      (function () { field.hydrate(0); }).should.throw(Restypie.TemplateErrors.BadType);
      (function () { field.hydrate(NaN); }).should.throw(Restypie.TemplateErrors.BadType);
      (function () { field.hydrate(''); }).should.throw(Restypie.TemplateErrors.BadType);
      (function () { field.hydrate({}); }).should.throw(Restypie.TemplateErrors.BadType);
      (function () { field.hydrate([]); }).should.throw(Restypie.TemplateErrors.BadType);
      (function () { field.hydrate(new Date()); }).should.throw(Restypie.TemplateErrors.BadType);
    });

  });
});