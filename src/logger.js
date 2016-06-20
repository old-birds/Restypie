'use strict';

let Winston = require('winston');

let Restypie = require('../');

let logger = new Winston.Logger({
  level: 'error',
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