'use strict';

const Winston = require('winston');

const Restypie = require('./');

/* istanbul ignore next */
const logger = new Winston.Logger({
  level: process.env.RESTYPIE_DEBUG || process.env.NODE_ENV === 'development' ? 'warn' : 'error',
  transports: [
    new Winston.transports.Console({
      timestamp() { return new Date().toISOString(); },
      formatter: function (options) {
        let id = `[RESTYPIE ${Restypie.VERSION} ${options.level.toUpperCase()}]`;
        return Winston.config.colorize(options.level, options.timestamp() + ' ' + id + ' ' +
          options.message);
      },
      prettyPrint: true,
      colorize: 'all'
    })
  ]
});

module.exports = logger;