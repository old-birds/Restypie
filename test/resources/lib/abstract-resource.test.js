'use strict';

const Restypie = require('../../../');

describe('abstract resource', function () {
  class MyResource extends Restypie.Resources.AbstractResource {
    get path() { return '/my-resources'; }
    get defaultSelect() { return ['id2', 'names'] }
    get schema() {
      return {
        id: { type: 'int', isPrimaryKey: true },
        name: { type: String, isWritable: true, isFilterable: true, filteringWeight: 100 },
        readOnly: {
          type: 'int', isReadable: true,
          canRead: (bundle) => {
            return Promise.resolve(!!bundle.isSudo);
          }
        }
      };
    }
  }

  class MyResource2 extends Restypie.Resources.AbstractResource {
    get path() { return '/my-resources'; }
    get defaultSelect() { return ['id', 'name', 'readOnly'] }
    get schema() {
      return {
        id: { type: 'int', isPrimaryKey: true },
        name: { type: String, isWritable: true, isFilterable: true, filteringWeight: 100 },
        readOnly: {
          type: 'int', isReadable: true,
          canWriteOnCreate: (bundle) => {
            return Promise.resolve(!!bundle.isSudo);
          }
        }
      };
    }
  }

  describe('default select', function () {
    const api = new Restypie.API({ path: 'v1', routerType: Restypie.RouterTypes.EXPRESS });

    it('should map default select validation error (missing property)', function () {
       (() => new MyResource(api)).should.throw('Schema doesnt have this property id2');
    });

    it('should map default select validation error (invalid authorization override)', function () {
       (() => new MyResource2(api)).should.throw(`Cannot override authentication for default select value 'readOnly', got: canWriteOnCreate`);
    });

  });
});
