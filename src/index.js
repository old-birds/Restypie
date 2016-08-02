'use strict';

let packageJSON = require('../package.json');
let _ = require('lodash');

const Restypie = module.exports = {

  VERSION: packageJSON.version,

  TEST_ENV: 'restypie-test',

  SUDO_HEADER_NAME: 'x-restypie-signature',

  isSudo(headers) {
    // TODO check user-agent ?
    // TODO perform some kind of signature check
    const header = headers[Restypie.SUDO_HEADER_NAME];
    return !!header;
  },
  
  getSudoHeader() {
    return { [Restypie.SUDO_HEADER_NAME]: Restypie.getSudoSignature() };
  },

  getSudoSignature() {
    // TODO generate a real secure signature. Allow for custom ones ?
    return Date.now();
  },

  OPERATOR_SEPARATOR: '__',
  EQUALITY_OPERATOR: 'eq',
  LIST_SEPARATOR: ',',
  get LIST_SEPARATOR_REG() { return new RegExp('\\\s*' + this.LIST_SEPARATOR + '\\\s*', 'g'); },

  RouterTypes: {
    KOA_ROUTER: 'koa-router',
    EXPRESS: 'express'
  },
  
  QueryOptions: {
    NO_COUNT: 'NO_COUNT',
    INCLUDE_SCORE: 'INCLUDE_SCORE',
    SCORE_ONLY: 'SCORE_ONLY'
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
    if (!str || !str.length) return [];
    return str.split(this.LIST_SEPARATOR_REG);
  },

  arrayToList(arr) { return (arr || []).join(this.LIST_SEPARATOR); },

  stringify(options) {
    options = options || {};
    options.sort = Restypie.Utils.makeArray(options.sort);
    options.populate = Restypie.Utils.makeArray(options.populate);
    options.select = Restypie.Utils.makeArray(options.select);
    options.filters = options.filters || {};
    options.options = Restypie.Utils.makeArray(options.options);

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
    if (options.options.length) qs.options = this.arrayToList(options.options);

    return qs;
  },

  mergeValuesForOperator(operator, values) {
    values = Array.from(arguments).filter(value => !_.isUndefined(value));
    operator = values.shift();

    if (!values.length) return {};

    switch (operator) {

      case 'in':
        values = _.uniq(values.reduce((acc, current) => {
          return _.intersection(acc, current);
        }, values.shift()));
        if (values.length === 1) return { eq: values[0] };
        return { in: values };

      case 'nin':
        values = _.uniq(values.reduce((acc, current) => {
          return acc.concat(current);
        }, values.shift()));
        if (values.length === 1) return { ne: values[0] };
        return { nin: values };


      case 'eq':
        values = _.uniq(values);
        if (values.length === 1) return { eq: values[0] };
        return { in: values };


      case 'ne':
        values = _.uniq(values);
        if (values.length === 1) return { ne: values[0] };
        return { nin: values };


      case 'gt':
      case 'gte':
        values = values.sort();
        return { [operator]: values.pop() };

      case 'lt':
      case 'lte':
        values = values.sort();
        return { [operator]: values.shift() };

      default:
        throw new Error(`Don't know how to merge values for operator ${operator}`);
    }
  },

  dedupeFilters(filters) {
    if ('in' in filters) {
      if (!filters.in.length) { // Nothing else matters, since we're looking for an empty list
        Object.keys(filters).forEach((operator) => {
          if (operator !== 'in') delete filters[operator];
        });
        return filters;
      }
      if ('eq' in filters) {
        filters.in.push(filters.eq);
        delete filters.eq;
      }
      filters.in = _.uniq(filters.in);
      if (filters.in.length === 1) {
        filters.eq = filters.in[0];
        delete filters.in;
      }
    }

    if ('nin' in filters) {
      if (!filters.nin.length) {
        delete filters.nin;
      } else {
        if ('ne' in filters) {
          filters.nin.push(filters.ne);
          delete filters.ne;
        }
        filters.nin = _.uniq(filters.nin);
        if (filters.nin.length === 1) {
          filters.ne = filters.nin[0];
          delete filters.nin;
        }
      }
    }

    if (filters.in) {
      if (filters.nin) filters.nin.forEach((val) => _.pull(filters.in, val));
      if ('ne' in filters) _.pull(filters.in, filters.ne);
      if (filters.in.length === 1) {
        filters.eq = filters.in[0];
        delete filters.in;
      }
    }

    if ('eq' in filters && 'ne' in filters) {
      filters.in = [];
      delete filters.eq;
      delete filters.ne;
    }

    return filters;
  },
  
  mergeFilters(left, right) {
    const final = _.uniq(Object.keys(left).concat(Object.keys(right))).reduce((acc, key) => {
      acc[key] = Restypie.mergeFiltersForKey(left[key], right[key]);
      return acc;
    }, {});

    return final;
  },


  mergeFiltersForKey(left, right) {
    left = left || {};
    right = right || {};

    const operators = _.uniq(Object.keys(left).concat(Object.keys(right)));

    const allValues = {
      in: [],
      nin: [],
      eq: [],
      ne: [],
      gt: [],
      gte: [],
      lt: [],
      lte: []
    };

    operators.forEach((operator) => {
      const newFilter = Restypie.mergeValuesForOperator(operator, left[operator], right[operator]);
      operator = Object.keys(newFilter)[0];
      if (operator) allValues[operator].push(newFilter[operator]);
    });

    function findUnFlat() {
      for (const op of Object.getOwnPropertyNames(allValues)) {
        if (allValues[op].length > 1) return op;
      }
      return null;
    }

    let unFlat = findUnFlat();
    while (unFlat) {
      const newFilter = Restypie.mergeValuesForOperator.apply(null, [unFlat].concat(allValues[unFlat].splice(0)));
      const operator = Object.keys(newFilter)[0];
      if (operator) allValues[operator].push(newFilter[operator]);
      unFlat = findUnFlat();
    }

    const final = Object.keys(allValues).reduce((acc, operator) => {
      if (allValues[operator].length) acc[operator] = allValues[operator][0];
      return acc;
    }, {});

    return Restypie.dedupeFilters(final);
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