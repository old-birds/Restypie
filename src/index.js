'use strict';

let packageJSON = require('../package.json');
let _ = require('lodash');

const Restypie = module.exports = {

  VERSION: packageJSON.version,

  TEST_ENV: 'restypie-test',

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
    options.options = options.options || [];

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

  mergeValuesForOperator(operator, left, right) {
    switch (operator) {
      case 'in': return { in: _.intersection(left, right) };
      case 'nin': return { nin: _.uniq(left.concat(right)) };
      case 'eq': return { in: [left, right] };
      case 'ne': return { nin: [left, right] };
      case 'gt':
      case 'gte':
        return { [operator]: left > right ? left : right };
      case 'lt':
      case 'lte':
        return { [operator]: left < right ? left : right };
      default:
        throw new Error(`Don't know how to merge values for operator ${operator}`);
    }
  },
  
  mergeFilters(left, right) {
    right = _.cloneDeep(right); // We want to modify `left`, do not risk to modify `right`

    const keys = _.uniq(Object.keys(left).concat(Object.keys(right)));

    keys.forEach(function (key) {
      const leftFilter = left[key];
      const rightFilter = right[key];

      if (!rightFilter) return; // Do nothing if nothing to merge

      if (!leftFilter) { // Just copy, nothing to merge
        left[key] = rightFilter;
        return;
      }

      const operators = _.uniq(Object.keys(leftFilter).concat(Object.keys(rightFilter)));

      // Merge by operator
      operators.forEach(function (operator) {
        const leftValue = leftFilter[operator];
        const rightValue = rightFilter[operator];

        if (!rightValue) return; // Do nothing if nothing to merge

        if (!leftValue) { // Just copy, nothing to merge
          leftFilter[operator] = rightValue;
          return;
        }

        let newFilter = Restypie.mergeValuesForOperator(operator, leftValue, rightValue);
        const newOperator = Object.keys(newFilter)[0];

        if (newOperator !== operator && newOperator in leftFilter) {
          console.log(newOperator, leftFilter[newOperator], newFilter[newOperator]);
          newFilter = Restypie.mergeValuesForOperator(newOperator, leftFilter[newOperator], newFilter[newOperator]);
          console.log(newFilter);
        }

        Object.assign(leftFilter, newFilter);
      });

      // Special cases

      if (leftFilter.in && leftFilter.eq) {
        leftFilter.in = _.uniq(leftFilter.in.concat(leftFilter.eq));
        delete leftFilter.eq;
      }

      if (leftFilter.nin && leftFilter.ne) {
        leftFilter.nin = _.uniq(leftFilter.nin.concat(leftFilter.ne));
        delete leftFilter.ne;
      }

      if (leftFilter.in && leftFilter.nin) _.pullAll(leftFilter.in, leftFilter.nin);
    });

    return left;
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