'use strict';

let packageJSON = require('./package.json');
let _ = require('lodash');

module.exports = {

  VERSION: packageJSON.version,

  OPERATOR_SEPARATOR: '__',
  EQUALITY_OPERATOR: 'eq',
  LIST_SEPARATOR: ',',
  get LIST_SEPARATOR_REG() { return new RegExp('\\\s*' + this.LIST_SEPARATOR + '\\\s*', 'g'); },

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

  get API() { return require('./src/api'); },
  get Route() { return require('./src/route'); },
  get Resources() { return require('./src/resources'); },
  get BasicRoutes() { return require('./src/basic-routes'); },
  get Fields() { return require('./src/fields'); },
  get RestErrors() { return require('./src/rest-errors'); },
  get TemplateErrors() { return require('./src/template-errors'); },
  get RoutesSorter() { return require('./src/routes-sorter'); },
  get Bundle() { return require('./src/bundle'); },
  get Serializers() { return require('./src/serializers'); },
  get Methods() { return require('./src/methods'); },
  get Codes() { return require('./src/codes'); },
  get Utils() { return require('./src/utils'); },
  get Url() { return require('./src/url'); },
  get Operators() { return require('./src/operators'); },
  get Client() { return require('./src/client'); },
  get Model() { return require('./src/model'); },
  get Query() { return require('./src/client/lib/query'); },
  get Logger() { return require('./src/logger'); }

};