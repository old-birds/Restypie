'use strict';

// TODO this file is messy, split it and factorize it out
// TODO go back to school and learn some theoretical maths
// TODO find out why this is giving good results... ^

const Promise = require('bluebird');

const Restypie = require('./');

class Score {

  get value() { return this._value; }

  get displayValue() { return Math.round(Score.valueToPercent(this._value)); }

  get invertedValue() { return 1 - this._value; }


  constructor(value, isPercent) {
    if (value === -Infinity) value = 0;
    if (value === Infinity) value = 100;
    this._value = isPercent ? Score.percentToValue(value) : value;
  }

  static percentToValue(percent) { return percent / 100; }
  static valueToPercent(value) { return value * 100; }
}

class FieldByOperatorScore extends Score {

  constructor(fieldWeight, operatorWeight) {
    super(Score.percentToValue(fieldWeight) * Score.percentToValue(operatorWeight));
  }

}

class QueryScore {

  constructor(fields, bundle) {
    this._fields = fields;
    this._bundle = bundle;

    Restypie.Utils.assertIsInstanceOf(this._bundle, Restypie.Bundle);
    fields.forEach((field) => Restypie.Utils.assertIsInstanceOf(field, Restypie.Fields.AbstractField));
  }

  compute() {
    const bundle = this._bundle;
    const final = this._computeOwn(this._formatFilters(bundle.filters || {}));

    return this._computeNested(bundle.nestedFilters || {}).then((remoteScores) => {
      Object.assign(final.filters, remoteScores);
      this._setLevels(final);
      if (bundle.hasNestedFilters) this._penalizeDeepNesting(final);
      return Promise.resolve(final);
    });
  }

  _computeOwn(originalFilters) {
    const displayFilters = {};

    const own = new Score(1 - 1 / originalFilters.reduce((final, field) => {
      const displayFilter = displayFilters[field.key] = displayFilters[field.key] || {};
      displayFilter[field.operator] = field.score.displayValue;
      return final + 1 / field.score.invertedValue;
    }, originalFilters.length > 1 ? 1 : 0));

    return { total: own.displayValue, maxLevel: 1, filters: displayFilters };
  }

  _computeNested(originalFilters) {
    return Promise.reduce(Object.keys(originalFilters), (final, key) => {
      const field = this._getFieldByPath(key);
      const client = field.to.createClient({ defaultHeaders: this._bundle.safeHeaders });
      return client.getQueryScore(originalFilters[key]).then((score) => {
        final[key] = score;
        return final;
      });
    }, {});
  }

  _setLevels(score) {
    Object.keys(score.filters).forEach((key) => {
      const current = score.filters[key];
      let level = 1;

      function find(filter) {
        if ('filters' in filter) {
          ++level;
          Object.keys(filter.filters).forEach(sub => find(filter.filters[sub]));
        }
      }

      find(current);
      current.level = level;
    });
  }

  _penalizeDeepNesting(score) {
    const allScores = [{ total: score.total, level: 1 }];
    let maxLevel = 1;

    Object.keys(score.filters).forEach((prop) => {
      const current = score.filters[prop];
      if ('filters' in current) {
        allScores.push({ total: current.total, level: current.level });
      }
    });
    
    score.total = new Score((allScores.reduce((acc, deepScore) => {
      if (deepScore.level > maxLevel) maxLevel = deepScore.level;
      return acc + (deepScore.total / deepScore.level);
    }, 0)) / (maxLevel + allScores.length - 1), true).displayValue;

    score.maxLevel = maxLevel;
  }

  _getFieldByPath(path) {
    return this._fields.find((field) => field.path === path);
  }

  _formatFilters(originalFilters) {
    return Object.keys(originalFilters).reduce((final, path) => {
      const field = this._getFieldByPath(path);
      const fieldFilters = originalFilters[path];

      Object.keys(fieldFilters).forEach((operator) => {
        final.push({
          key: field.key,
          field,
          filters: fieldFilters,
          operator,
          score: new FieldByOperatorScore(field.filteringWeight, field.getOperatorByName(operator).filteringWeight)
        });
      });

      return final;
    }, []);
  }


  static compute(fields, bundle) {
    const instance = new this(fields, bundle);
    return instance.compute();
  }

}

module.exports = QueryScore;













