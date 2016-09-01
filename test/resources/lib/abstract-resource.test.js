'use strict';

const Restypie = require('../../../');

describe('abstract resource', function () {
  class MyResource extends Restypie.Resources.AbstractResource {
    get path() { return '/my-resources'; }
    get defaultSelect() { return ['id2', 'names'] }
    get schema() {
      return {
        id: { type: 'int', isPrimaryKey: true },
        name: { type: String, isWritable: true, isFilterable: true, filteringWeight: 100 }
      };
    }
  }

  describe('default select', function () {
    const api = new Restypie.API({ path: 'v1', routerType: Restypie.RouterTypes.EXPRESS });

    it('should map default select validation error', function () {
       (() => new MyResource(api)).should.throw('Schema doesnt have this property id2');
    });
  });
});