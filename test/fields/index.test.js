'use strict';

describe('Restypie.Fields', function () {

  describe('constructor', function () {
    it('getters...', function () {
      Restypie.Fields.ToOneField;
    });

  });

  describe('.match()', function () {
    it('should return the field class itself', function () {
      Restypie.Fields.match(Restypie.Fields.FloatField).should.equal(Restypie.Fields.FloatField);
    });
    it('should interpret String to StringField', function () {
      Restypie.Fields.match(String).should.equal(Restypie.Fields.StringField);
    });
    it('should interpret Number to FloatField', function () {
      Restypie.Fields.match(Number).should.equal(Restypie.Fields.FloatField);
    });
    it('should interpret Date to Date', function () {
      Restypie.Fields.match(Date).should.equal(Restypie.Fields.DateField);
    });
    it('should interpret Boolean to BooleanField', function () {
      Restypie.Fields.match(Boolean).should.equal(Restypie.Fields.BooleanField);
    });
    it('should interpret "int" to IntegerField', function () {
      Restypie.Fields.match('int').should.equal(Restypie.Fields.IntegerField);
    });
    it('should interpret "integer" to IntegerField', function () {
      Restypie.Fields.match('integer').should.equal(Restypie.Fields.IntegerField);
    });
    it('should interpret "float" to FloatField', function () {
      Restypie.Fields.match('float').should.equal(Restypie.Fields.FloatField);
    });
    it('should interpret "file" to FileField', function () {
      Restypie.Fields.match('file').should.equal(Restypie.Fields.FileField);
    });
    it('should interpret "bool" to FileField', function () {
      Restypie.Fields.match('bool').should.equal(Restypie.Fields.BooleanField);
    });
    it('should interpret "boolean" to FileField', function () {
      Restypie.Fields.match('boolean').should.equal(Restypie.Fields.BooleanField);
    });
    it('should interpret "any" to FileField', function () {
      Restypie.Fields.match('any').should.equal(Restypie.Fields.AnyField);
    });
    it('should throw if no match found', function () {
      (function () {
        Restypie.Fields.match('foo');
      }).should.throw(/valid type/);
    });
  });

});