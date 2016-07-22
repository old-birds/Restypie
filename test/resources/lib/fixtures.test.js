'use strict';

const _ = require('lodash');

describe('Resources.FixturesResource', function () {

  for (const routerType of _.values(Restypie.ROUTER_TYPES)) {

    before(function () {
      Restypie.setRouterType(routerType);
    });

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