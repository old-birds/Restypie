'use strict';

const Restypie = require('../../../');

module.exports = function (options) {

  const api = options.api;
  
  return class MyResource extends Restypie.Resources.FixturesResource {
    get path() { return '/my-resources'; }
    //get defaultSelect() { return ['id2', 'names'] }
    get routes() {
      return [
        Restypie.BasicRoutes.PostRoute,
        Restypie.BasicRoutes.GetSingleRoute,
        Restypie.BasicRoutes.GetManyRoute,
        Restypie.BasicRoutes.PatchSingleRoute,
        Restypie.BasicRoutes.DeleteSingleRoute
      ];
    }
    get schema() {
      return {
        id: { type: 'int', isPrimaryKey: true },
        name: { type: String, isWritable: true, isFilterable: true, filteringWeight: 100 }
      };
    }
  }
  
};