'use strict';

const AbstractField = Restypie.Fields.AbstractField;


describe('Restypie.Fields.AbstractField', function () {

  class Field extends AbstractField {};

  describe('constructor', function () {

    it('should set isRequired to true if isWritableOnce', function () {
      const field = new Field('key', { isWritableOnce: true });
      field.isWritableOnce.should.equal(true);
      field.isRequired.should.equal(true);
    });

    it('should NOT set isRequired to true if isWritableOnce and isRequired is provided', function () {
      const field = new Field('key', { isWritableOnce: true, isRequired: false });
      field.isWritableOnce.should.equal(true);
      field.isRequired.should.equal(false);
    });

    it('should set isPopulable', function () {
      const field = new Field('key', { isPopulable: true });
      field.isPopulable.should.equal(true);
    });

  });
});
