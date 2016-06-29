'use strict';

const _ = require('lodash');

describe('Resources.FixturesResource', function () {

  for (const routerType of _.values(Restypie.ROUTER_TYPES)) {

    before(function () {
      Restypie.setRouterType(routerType);
    });

    require('../../resource-test-suite')({
      resource: class FixturesResource extends Restypie.Resources.FixturesResource {
        createObject(bundle) {
          return super.createObject(bundle)
            .then(function (object) {
              object.createdOn = new Date();
              return Promise.resolve(object);
            });
        }
      }
    });

  }

});