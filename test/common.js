process.env.NODE_ENV = 'unit-test';

global.should = require('chai').should();
global.Restypie = require('../src');