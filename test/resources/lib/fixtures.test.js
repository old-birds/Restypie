'use strict';

describe('Resources.FixturesResource', function () {

  class FixturesResource extends Restypie.Resources.FixturesResource {
    createObject(bundle) {
      return super.createObject(bundle)
        .then(function (object) {
          object.createdOn = new Date();
          return Promise.resolve(object);
        });
    }
  }

  describe('Own tests', function () {

    it('should take initialFixtures as base', function () {
      const values = [1, 2, 3];

      class MyFixtures extends Restypie.Resources.FixturesResource {
        get initialFixtures() { return values; }
        get path() { return 'foo'; }
        get schema() {
          return {id: { type: 'int', isPrimaryKey: true } };
        }
      }

      const api = new Restypie.API();
      const instance = new MyFixtures(api);
      instance.fixtures.should.deep.equal(values);
    });

  });

  describe('Using Express', function () {
    require('../../resource-test-suite')({
      routerType: Restypie.RouterTypes.EXPRESS,
      resource: FixturesResource
    });
  });


  describe('Using Koa-Router', function () {
    require('../../resource-test-suite')({
      routerType: Restypie.RouterTypes.KOA_ROUTER,
      resource: FixturesResource
    });
  });


});