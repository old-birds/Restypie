'use strict';

const ToOneField = Restypie.Fields.ToOneField;


describe('Restypie.Fields.StringField', function () {

  it('should exist', function () {
    should.exist(ToOneField);
  });

  describe('constructor', function () {

    it('should throw if both toKey and fromKey are set', function () {
      (function () {
        new ToOneField('test', { fromKey: 'a', toKey: 'b', to: () => null });
      }).should.throw(/Ambiguous ToOneField, cannot have both fromKey and toKey/);
    });

  });

});
