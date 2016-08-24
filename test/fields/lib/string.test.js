'use strict';

let StringField = Restypie.Fields.StringField;


describe('Restypie.Fields.StringField', function () {

  it('should exist', function () {
    should.exist(StringField);
  });

  describe('constructor', function () {

    it('should have `minLength` and `maxLength` properties', function () {
      let stringField = new StringField('foo', {
        minLength: 1,
        maxLength: 20
      });

      stringField.minLength.should.equal(1);
      stringField.maxLength.should.equal(20);
    });

    it('should have `minLength` and `maxLength` properties (from lengthRange)', function () {
      let stringField = new StringField('foo', {
        lengthRange: [1, 20]
      });

      stringField.minLength.should.equal(1);
      stringField.maxLength.should.equal(20);
    });

    it('should have `minLength` and `maxLength` set to defaults (Infinity)', function () {
      let stringField = new StringField('foo', {
        lengthRange: ['a', 'b']
      });

      stringField.minLength.should.equal(-Infinity);
      stringField.maxLength.should.equal(Infinity);
    });

    it('should have `pattern` property', function () {
      let stringField = new StringField('foo', {
        pattern: /abc/
      });

      stringField.pattern.should.deep.equal(/abc/);
    });

    it('should not have `pattern` property (not a valid RegExp)', function () {
      let stringField = new StringField('foo', {
        pattern: ['a', 'b']
      });

      should.not.exist(stringField.pattern);
    });

  });

  describe('.hydrate', function () {
    let stringField = new StringField('foo', {});

    it('should return the argument value', function () {
      stringField.hydrate('bar').should.equal('bar');
    });

    it('should stringify the argument number', function () {
      stringField.hydrate(123).should.equal('123');
    });

    it('should throw an error if not a string or a number', function () {
      (function () {
        stringField.hydrate({});
      }).should.throw(Restypie.TemplateErrors.BadType);
    });

  });

  describe('.dehydrate', function () {
    let stringField = new StringField('foo', {});

    it('should return null for an undefined argument', function () {
      should.equal(stringField.dehydrate(undefined), '');
    });

    it('should return null for a null argument', function () {
      should.equal(stringField.dehydrate(null), null);
    });

    it('should return the argument value', function () {
      stringField.dehydrate('bar').should.equal('bar');
    });

    it('should stringify the argument number', function () {
      stringField.dehydrate(123).should.equal('123');
    });

    it('should throw an error if not a string or a number', function () {
      (function () {
        stringField.dehydrate({});
      }).should.throw(Restypie.TemplateErrors.BadType);
    });

  });

  describe('.validate', function () {

    it('should be valid (no constraints)', function () {
      (function () {
        new StringField('foo', {}).validate('abc');
      }).should.not.throw();
    });

    it('should be valid (fits minLength)', function () {
      (function () {
        new StringField('foo', { minLength: 2 }).validate('abc');
      }).should.not.throw();
    });

    it('should be valid (fits maxLength)', function () {
      (function () {
        new StringField('foo', { maxLength: 4 }).validate('abc');
      }).should.not.throw();
    });

    it('should be valid (fits pattern)', function () {
      (function () {
        new StringField('foo', { pattern: /^[A-Za-z]+$/ }).validate('abc');
      }).should.not.throw();
    });

    it('should not be valid (does not fit minLength)', function () {
      (function () {
        new StringField('foo', { minLength: 4 }).validate('abc');
      }).should.throw(Restypie.TemplateErrors.OutOfRange);
    });

    it('should not be valid (does not fit maxLength)', function () {
      (function () {
        new StringField('foo', { maxLength: 4 }).validate('abcde');
      }).should.throw(Restypie.TemplateErrors.OutOfRange);
    });

    it('should not be valid (does not fit pattern)', function () {
      (function () {
        new StringField('foo', { pattern: /^\d+$/ }).validate('abcde');
      }).should.throw(Restypie.TemplateErrors.BadPattern);
    });

  });

});