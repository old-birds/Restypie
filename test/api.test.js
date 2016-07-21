'use strict';


describe.skip('Restypie.API', function () {

  describe('constructor', function () {
    it('should instantiate a new API with no options', function () {
      new Restypie.API({ routerType: Restypie.RouterTypes.EXPRESS });
    });

    it('should instantiate a new API with a path', function () {
      const api = new Restypie.API({ path: 'v1' });
      api.path.should.equal('v1');
    });

    it('should instantiate a new API with default path', function () {
      const api = new Restypie.API();
      api.path.should.equal('');
    });

    it('should instantiate a new API with a router', function () {
      const api = new Restypie.API({ router: {} });
      api.router.should.deep.equal({});
    });

    it('should instantiate a new API with a host', function () {
      const api = new Restypie.API({ host: 'http://localhost:3000' });
      api.host.should.equal('http://localhost:3000');
    });
  });

  describe('#launch()', function () {

    it('should NOT launch the API with no router', function () {
      const api = new Restypie.API();
      (function () {
        api.launch(null, 'http://localhost:3000');
      }).should.throw(/router/);
    });

    it('should NOT launch the API with no host', function () {
      const api = new Restypie.API();
      (function () {
        api.launch({});
      }).should.throw(/host/);
    });

    it('should launch the API', function () {
      const api = new Restypie.API();
      api.launch({}, 'http://localhost:3000');
      api.isLaunched.should.equal(true);
    });

    it('should NOT launch the API if its already launched', function () {
      const api = new Restypie.API();
      api.launch({}, 'http://localhost:3000');
      (function () {
        api.launch();
      }).should.throw(/launched once/);
    });

  });

  describe('#registerResource()', function () {

    it('should register a resource', function () {
      const api = new Restypie.API();
      class FooResource extends Restypie.Resources.FixturesResource {
        get path() { return 'foo'; }
        get schema() { return { id: { type: String, isPrimaryKey: true } }; }
      }
      api.registerResource('foo', FooResource);
      Object.keys(api.resources).length.should.equal(1);
      api.resources.should.have.keys(['foo']);
    });

    it('should NOT allow to register a resource with duplicate name', function () {
      const api = new Restypie.API();
      class FooResource extends Restypie.Resources.FixturesResource {
        get path() { return 'foo'; }
        get schema() { return { id: { type: String, isPrimaryKey: true } }; }
      }
      api.registerResource('foo', FooResource);
      (function () {
        api.registerResource('foo', FooResource);
      }).should.throw(/same name/);
    });
  });

  describe('#registerResources()', function () {

    it('should register multiple resources', function () {
      const api = new Restypie.API();
      class FooResource extends Restypie.Resources.FixturesResource {
        get path() { return 'foo'; }
        get schema() { return { id: { type: String, isPrimaryKey: true } }; }
      }
      class BarResource extends Restypie.Resources.FixturesResource {
        get path() { return 'bar'; }
        get schema() { return { id: { type: String, isPrimaryKey: true } }; }
      }
      api.registerResources({ foo: FooResource, bar: BarResource });
      Object.keys(api.resources).length.should.equal(2);
      api.resources.should.have.keys(['foo', 'bar']);
    });

    it('should not accept arguments other than plain objects', function () {
      const api = new Restypie.API();
      (function () {
        api.registerResources(new Buffer(''));
      }).should.throw(/named resources/);
    });

  });

});