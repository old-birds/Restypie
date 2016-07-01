'use strict';

describe('Restypie.Url', function () {

  describe('.join()', function () {
    it('should remove unnecessary slashes', function () {
      Restypie.Url.join('/v1', '/', '/users').should.equal('/v1/users');
    });
    it('should preserve protocol', function () {
      Restypie.Url.join('http://example.com', 'v1', 'users').should.equal('http://example.com/v1/users');
    });
  });

  describe('.ensureHTTPProtocol()', function () {
    it('should add missing protocol - default to http', function () {
      Restypie.Url.ensureHTTPProtocol('example.com/v1/user').should.equal('http://example.com/v1/user');
    });
    it('should leave the parameter unchanged', function () {
      Restypie.Url.ensureHTTPProtocol('http://example.com/v1/user').should.equal('http://example.com/v1/user');
    });
    it('should change from http to https', function () {
      Restypie.Url.ensureHTTPProtocol('http://example.com/v1/user', true).should.equal('https://example.com/v1/user');
    });
    it('should add https', function () {
      Restypie.Url.ensureHTTPProtocol('example.com/v1/user', true).should.equal('https://example.com/v1/user');
    });
    it('should add http', function () {
      Restypie.Url.ensureHTTPProtocol('example.com/v1/user', false).should.equal('http://example.com/v1/user');
    });
  });


});