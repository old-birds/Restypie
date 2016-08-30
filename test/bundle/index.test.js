'use strict';

const HTTPMocks = require('node-mocks-http');;

describe('Restypie.Bundle', function () {
  it('should use the parameter url to build nav links', function () {
    const req = HTTPMocks.createRequest();
    const res = HTTPMocks.createResponse();
    const bundle = new Restypie.Bundle({ req, res, url: '/a/test/url' }).setLimit(20).setOffset(20);
    const links = bundle.getNavLinks(50);
    links.next.should.equal('/a/test/url?limit=20&offset=40');
    links.prev.should.equal('/a/test/url?limit=20&offset=0');
  });
});