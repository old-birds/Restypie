'use strict';

const coveralls = require('coveralls');

let args = require('minimist')(process.argv, {
  strings: ['file'],
  booleans: ['build']
});

module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-githooks');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-mocha-cov');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-mocha-istanbul');


  let CHECK_MATCH = [
    'src/**/*.js'
  ];


  grunt.initConfig({

    /**
     * Istanbul coverage
     */
    mocha_istanbul: {
      coverage: {
        src: ['./test/**/*.test.js'],
        options: {
          quiet: true,
          recursive: true,
          require: [
            './test/common.js'
          ],
          scriptPath: require.resolve('./node_modules/.bin/istanbul')
        }
      },
      coveralls: {
        src: ['./test/**/*.test.js'],
        options: {
          quiet: true,
          coverage: true,
          recursive: true,
          require: [
            './test/common.js'
          ],
          scriptPath: require.resolve('./node_modules/.bin/istanbul')
        }
      }
    },

    /**
     * Git pre-push hook
     */
    githooks: {
      all: {
        'pre-push': 'check'
      }
    },

    /**
     * Mocha
     */
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          recursive: true,
          require: [
            './test/common.js'
          ]
        },
        src: args.file || ['./test/**/*.test.js']
      }
    },

    /**
     * JSHint
     */
    jshint: {
      options: {
        jshintrc: true,
        reporter: require('jshint-stylish')
      },
      all: CHECK_MATCH
    },

    /**
     * JS Code Sniffer
     */
    jscs: {
      all: CHECK_MATCH,
      options: {
        config: '.jscsrc'
      }
    }
  });

  grunt.event.on('coverage', function(lcov, done){
    return coveralls.handleInput(lcov, done);
  });

  grunt.registerTask('hooks', 'githooks');
  grunt.registerTask('test', 'mochaTest:test');
  grunt.registerTask('check', ['hooks', 'jshint', 'jscs', 'test']);
  grunt.registerTask('default', 'check');
  grunt.registerTask('cov', ['mocha_istanbul:coverage']);
  grunt.registerTask('coveralls', ['mocha_istanbul:coveralls']);
  grunt.registerTask('doc', 'Build or serve YUIDOC', function () {
    let docArgs = [];
    if (!args.build) docArgs.push('--server');
    grunt.log.subhead((args.build ? 'Building' : 'Serving') + ' YUIDOC');
    grunt.util.spawn({
      cmd: 'yuidoc',
      args: docArgs,
      opts: { stdio: 'inherit' }
    }, this.async());
  });
};
