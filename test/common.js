const Restypie = require('../src');

process.env.NODE_ENV = Restypie.TEST_ENV;

global.should = require('chai').should();
global.Restypie = Restypie;