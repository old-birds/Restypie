'use strict';

const Sequelize = require('sequelize');
const express = require('express');
const http = require('http');
const Restypie = require('../../../');

function myResources(options) {

  const api = options.api;
  
  return class MyResource extends Restypie.Resources.FixturesResource {
    get path() { return '/my-resources'; }
    get defaultSelect() { return ['id2', 'names'] }
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

describe('Abstract Resource', function () {
  class SequelizeResource extends Restypie.Resources.SequelizeResource {
    get model() { return Resource; }
  }

  describe('Default select with undefined value from schema should throw', function () {
    const app = express();

    const api = new Restypie.API({ path: 'v1', routerType: Restypie.RouterTypes.EXPRESS });
    const PORT = 8333;
    const server = http.createServer(app);
    before(function (cb) {
      return server.listen(PORT, cb);
    });

    it('should map default select validation error', function () {
    try{
    const Resource = myResources({
      api,
      resource: SequelizeResource
    });
    }
    catch(err) {
        err.toString().should.contain('Error: Schema doesnt have this property id2');
        return Promise.resolve();
    };
    });
  });
});