'use strict';


describe('Restypie.Serializers.JSONSerializer', function () {

  describe('constructor', function () {
    it('should call getters...', function () {
      Restypie.Serializers.JSONSerializer.mimeType;
      Restypie.Serializers.JSONSerializer.aliases;
    });
  });
  
  describe('.serialize()', function () {
    it('should serialize a valid JSON string', function () {
      return Restypie.Serializers.JSONSerializer.serialize(JSON.stringify({ foo: 'bar' })).then((serialized) => {
        serialized.should.deep.equal({ foo: 'bar' });
      });
    });

    it('should throw trying to serialize an invalid JSON string', function () {
      return Restypie.Serializers.JSONSerializer.serialize("{ foo: 'bar' }").catch((err) => {
        should.exist(err);
        /unexpected token/i.test(err.message).should.equal(true);
      });
    });

    it('should serialize plain object as itself', function () {
      return Restypie.Serializers.JSONSerializer.serialize({ foo: 'bar' }).then((serialized) => {
        serialized.should.deep.equal({ foo: 'bar' });
      });
    });

    it('should not try to parse complex objects', function () {
      return Restypie.Serializers.JSONSerializer.serialize(new Buffer('')).catch((err) => {
        should.exist(err);
        /parse/i.test(err.message).should.equal(true);
      });
    });
  });
  
});