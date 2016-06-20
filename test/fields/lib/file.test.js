'use strict';

let FileField = Restypie.Fields.FileField;


describe('Restypie.Fields.FileField', function () {

  it('should exist', function () {
    should.exist(FileField);
  });

  describe('constructor', function () {

    it('should have a max size', function () {
      let maxSize = 10000;
      let field = new FileField('foo', { maxSize });
      field.maxSize.should.equal(maxSize);
    });

    it('should have the default max size (value lower than 0)', function () {
      let field = new FileField('foo', { maxSize: -1 });
      field.maxSize.should.equal(Infinity);
    });

    it('should have the default max size (value is not a valid number)', function () {
      let field = new FileField('foo', { maxSize: NaN });
      field.maxSize.should.equal(Infinity);
      field = new FileField('foo', { maxSize: '2345' });
      field.maxSize.should.equal(Infinity);
    });

  });

  describe('.buildFilePath', function () {

    let field = new FileField('foo');

    it('should return a string', function () {
      field.buildFilePath({}).should.be.a('string');
    });

  });

});