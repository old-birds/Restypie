'use strict';


describe('Restypie.API', function () {

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

    it('should instantiate a new API with routes', function () {
      class SelfRoute extends Restypie.Route {
        get path() { return 'foo'; }
        handler(bundle) {
          return bundle.res.end('OK');
        }
      }

      const api = new Restypie.API({
        host: 'http://localhost:3000',
        routerType: Restypie.RouterTypes.EXPRESS,
        routes: [SelfRoute]
      });
      api.routes.should.be.an('array').and.have.lengthOf(1);
      api.routes[0].should.be.an.instanceOf(SelfRoute);
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

  describe('self routes', function () {
    const supertest = require('supertest');
    const app = require('express')();
    const server = require('http').createServer(app);
    const PORT = 3000;

    const api = new Restypie.API({
      path: 'my-api',
      routerType: Restypie.RouterTypes.EXPRESS,
      routes: [
        class extends Restypie.Route {
          get path() { return 'foo'; }
          handler(bundle) {
            const res = bundle.res;
            res.statusCode = Restypie.Codes.OK;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ foo: 'bar' }));
          }
        }
      ]
    });

    api.launch(app, { port: PORT });

    before(function (done) {
      return server.listen(PORT, done);
    });


    it('should be able to access the route', function (done) {
      return supertest(app)
        .get('/my-api/foo')
        .expect(Restypie.Codes.OK, (err, res) => {
          if (err) return done(err);
          res.body.should.deep.equal({ foo: 'bar' });
          return done();
        });
    });
  });

});