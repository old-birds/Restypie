'use strict';

let packageJSON = require('../package.json');
let _ = require('lodash');

const Restypie = module.exports = {

  VERSION: packageJSON.version,

  OPERATOR_SEPARATOR: '__',
  EQUALITY_OPERATOR: 'eq',
  LIST_SEPARATOR: ',',
  get LIST_SEPARATOR_REG() { return new RegExp('\\\s*' + this.LIST_SEPARATOR + '\\\s*', 'g'); },

  RouterTypes: {
    KOA_ROUTER: 'koa-router',
    EXPRESS: 'express'
  },
  
  RESERVED_WORDS: ['limit', 'offset', 'sort', 'select', 'format', 'populate', 'options'],
  
  isSupportedRouterType(type) {
    return _.contains(_.values(Restypie.RouterTypes), type);
  },
  
  assertSupportedRouterType(type) {
    if (!Restypie.isSupportedRouterType(type)) {
      throw new Error(`"routerType" should be one of : ${_.values(Restypie.RouterTypes).join(', ')}`);
    }
  },

  listToArray(str) {
    if (!str) return [];
    return str.split(this.LIST_SEPARATOR_REG);
  },

  arrayToList(arr) { return (arr || []).join(this.LIST_SEPARATOR); },

  stringify(options) {
    options = options || {};
    options.sort = options.sort || [];
    options.populate = options.populate || [];
    options.select = options.select || [];
    options.filters = options.filters || {};

    let qs = {};

    Object.keys(options.filters).forEach((key) => {
      let filter = options.filters[key];
      if (_.isPlainObject(filter)) {
        Object.keys(filter).forEach((operator) => {
          let operandKey = key + this.OPERATOR_SEPARATOR + operator;
          let value = filter[operator];
          switch (operator) {
            case 'in':
            case 'nin':
              qs[operandKey] = this.arrayToList(value);
              break;
            default:
              qs[operandKey] = value;
              break;
          }
        });
      } else {
        qs[key] = filter;
      }
    });

    if (!this.Utils.isNone(options.limit)) qs.limit = options.limit;
    if (!this.Utils.isNone(options.offset)) qs.offset = options.offset;

    if (options.populate.length) qs.populate = this.arrayToList(options.populate);
    if (options.select.length) qs.select = this.arrayToList(options.select);
    if (options.sort.length) qs.sort = this.arrayToList(options.sort);

    return qs;
  },

  get API() { return require('./api'); },
  get Route() { return require('./route'); },
  get Resources() { return require('./resources'); },
  get BasicRoutes() { return require('./basic-routes'); },
  get Fields() { return require('./fields'); },
  get RestErrors() { return require('./rest-errors'); },
  get TemplateErrors() { return require('./template-errors'); },
  get RoutesSorter() { return require('./routes-sorter'); },
  get Bundle() { return require('./bundle'); },
  get Serializers() { return require('./serializers'); },
  get Methods() { return require('./methods'); },
  get Codes() { return require('./codes'); },
  get Utils() { return require('./utils'); },
  get Url() { return require('./url'); },
  get Operators() { return require('./operators'); },
  get Client() { return require('./client'); },
  get Query() { return require('./client/lib/query'); },
  get Logger() { return require('./logger'); }

};