'use strict';


describe('Restypie.Serializers.AbstractSerializer', function () {

  describe('constructor', function () {
    it('should call getters...', function () {
      Restypie.Serializers.AbstractSerializer.mimeType;
      Restypie.Serializers.AbstractSerializer.aliases;
    });
    it('should NOT instantiate an abstract serializer (class is static)', function () {
      (function () {
        new Restypie.Serializers.AbstractSerializer();
      }).should.throw(/static/);
    });
  });

  describe('.serialize()', function () {
    it('should serialize transparently', function () {
      const obj = { foo: 'bar' };
      return Restypie.Serializers.AbstractSerializer.serialize(obj).then((serialized) => {
        serialized.should.equal(obj);
      });
    });
  });

});