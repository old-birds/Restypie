'use strict';

describe('Resources.FixturesResource', function () {

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

});