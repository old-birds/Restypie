'use strict';

/***********************************************************************************************************************
 * @namespace Restypie
 * @class BasicRoutes
 **********************************************************************************************************************/
module.exports = {
  get GetSingleRoute() { return require('./lib/get-single'); },
  get GetManyRoute() { return require('./lib/get-many'); },
  get PutSingleRoute() { return require('./lib/put-single'); },
  get DeleteSingleRoute() { return require('./lib/delete-single'); },
  get PostRoute() { return require('./lib/post'); },
  get PatchSingleRoute() { return require('./lib/patch-single'); },
  get PatchManyRoute() { return require('./lib/patch-many'); },
  get OptionsRoute() { return require('./lib/options'); }
};