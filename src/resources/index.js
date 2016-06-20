'use strict';

/***********************************************************************************************************************
 * @namespace Restypie
 * @class Resources
 **********************************************************************************************************************/
module.exports = {
  get AbstractResource() { return require('./lib/abstract-resource'); },
  get FixturesResource() { return require('./lib/fixtures'); },
  get ProxyResource() { return require('./lib/proxy'); },
  get AbstractCoreResource() { return require('./lib/abstract-core-resource'); },
  get SequelizeResource() { return require('./lib/sequelize'); },
  get RestypieResource() { return require('./lib/restypie'); }
};