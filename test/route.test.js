'use strict';

describe('Restypie.Route', function () {

  describe('constructor', function () {
    it('should instantiate a new route with default method', function () {
      class RightRoute extends Restypie.Route {
        get path() { return 'foo'; }
        handler(bundle) {
          return bundle.next();
        }
      }

      const route = new RightRoute({ routerType: Restypie.RouterTypes.EXPRESS }); // Should not throw
      route.method.should.equal(Restypie.Methods.GET);
    });

    it('should instantiate a new route with defined method', function () {
      class RightRoute extends Restypie.Route {
        get method() { return Restypie.Methods.POST; }
        get path() { return 'foo'; }
        handler(bundle) {
          return bundle.next();
        }
      }

      const route = new RightRoute({ routerType: Restypie.RouterTypes.EXPRESS }); // Should not throw
      route.method.should.equal(Restypie.Methods.POST);
    });

    it('should NOT instantiate a route without a path', function () {
      class WrongRoute extends Restypie.Route {
        handler(bundle) {
          return bundle.next();
        }
      }
      (function () {
        new WrongRoute({ routerType: Restypie.RouterTypes.EXPRESS });
      }).should.throw(/path/);
    });

    it('should NOT instantiate a route without a handler', function () {
      class WrongRoute extends Restypie.Route {
        get path() { return 'foo'; }
      }
      (function () {
        new WrongRoute({ routerType: Restypie.RouterTypes.EXPRESS });
      }).should.throw(/handler/);
    });

    it('should NOT instantiate a route with a non valid method', function () {
      class WrongRoute extends Restypie.Route {
        get path() { return 'foo'; }
        handler(bundle) {
          return bundle.next();
        }
        get method() { return 'WEIRD_VERB'; }
      }
      (function () {
        new WrongRoute({ routerType: Restypie.RouterTypes.EXPRESS });
      }).should.throw(/method/);
    });

    it('should call getters', function () {
      class RightRoute extends Restypie.Route {
        get method() { return Restypie.Methods.POST; }
        get path() { return 'foo'; }
        handler(bundle) {
          return bundle.next();
        }
      }

      const route = new RightRoute({ routerType: Restypie.RouterTypes.EXPRESS });
      route.path;
      route.method;
      route.context;
      route.handler;
    });

  });

  describe('#createBundleHandler', function () {
    class RightRoute extends Restypie.Route {
      get method() { return Restypie.Methods.POST; }
      get path() { return 'foo'; }
      handler(bundle) {
        return bundle.next();
      }
    }

    it('should create an express compatible handler', function () {
      const route = new RightRoute({ routerType: Restypie.RouterTypes.EXPRESS });
      const bundleHandler = route._handlers[0];
      bundleHandler.length.should.equal(3); // req, res, next
    });
    
    it('should create a koa-router compatible handler', function () {
      const route = new RightRoute({ routerType: Restypie.RouterTypes.KOA_ROUTER });
      const bundleHandler = route._handlers[0];
      bundleHandler.length.should.equal(1); // next
      (bundleHandler.constructor.name === 'GeneratorFunction').should.equal(true);
    });

  });

});