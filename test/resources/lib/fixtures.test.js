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