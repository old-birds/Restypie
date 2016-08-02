'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
const _ = require('lodash');

const Restypie = require('../../');

const AUTO_FILTERING_WEIGHT = Symbol('AUTO_FILTERING_WEIGHT');
const MAX_FILTERING_WEIGHT = 100;
const MIN_FILTERING_WEIGHT = 1;


/***********************************************************************************************************************
 * Abstract class for fields.
 *
 * @namespace Restypie.Fields
 * @class AbstractField
 * @constructor
 * @param {String} key Public key for the field, to be manipulated through the APIs.
 * @param {Object} options
 * @param {String} [options.path = key] Internal path of the field (might be different than the exposed/public `key`).
 * @param {Boolean} [options.isRequired = false] Is the field required ? If `true`, `isWritable` will also be
 * automatically set to true to stay consistent.
 * @param {Boolean} [options.isReadable = false] Defines whether or not the field can be read/selected.
 * @param {Boolean} [options.isWritable = false] Defines whether or not the field can be written.
 * @param {Boolean} [options.isFilterable = false] Defines whether or not the field can be filtered/sorted. If `true`,
 * `isReadable` will also be set to `true` to stay consistent.
 * @param {Boolean} [options.isWritableOnce = false] Defines whether or not the field can be updated once written. Be
 * careful that setting this prop to `true` will also set `isWritable` and `isRequired` to true in order to force the
 * first write.
 **********************************************************************************************************************/
module.exports = class AbstractField {

  get isRelation() { return false; }

  get supportedOperators() { return [Restypie.Operators.Eq]; }

  get optionsProperties() { return []; }

  get through() {
    return (!this._through || this._through instanceof Restypie.Resources.AbstractCoreResource) ?
      this._through :
      this._through();
  }

  get to() {
    return (!this._to || this._to instanceof Restypie.Resources.AbstractCoreResource) ?
      this._to :
      this._to();
  }

  get toKey() {
    return _.isString(this._toKey) ? this._toKey : this.to.primaryKeyField.key;
  }

  get fromKey() {
    return _.isString(this._fromKey) ? this._fromKey : this.key;
  }

  get filteringWeight() { return this._filteringWeight; }
  
  get normalizedFilteringWeight() { return (this._filteringWeight || MIN_FILTERING_WEIGHT) / 100; }

  /**
   * @constructor
   */
  constructor(key, options) {
    Restypie.Utils.forceAbstract(this, AbstractField, true);

    options = options || {};

    this.key = key;
    this.path = options.path || key;
    this.isRequired = !!options.isRequired;
    this.isWritable = !!options.isWritable;
    this.isFilterable = !!options.isFilterable;
    this.isReadable = !!options.isReadable;
    this.isWritableOnce = !!options.isWritableOnce;
    this.isPrimaryKey = !!options.isPrimaryKey;

    // Let's stay consistent - DO NOT change the order of those declarations
    if (this.isWritableOnce) this.isRequired = true;
    if (this.isRequired) this.isWritable = true;
    if (this.isPrimaryKey && !options.hasOwnProperty('isFilterable')) this.isFilterable = true;
    if (this.isPrimaryKey && !this.isFilterable) {
      Restypie.Logger.warn(`isPrimaryKey implies isFilterable for key ${this.key}`);
    }
    if (this.isFilterable) this.isReadable = true;
    this.isUpdatable = this.isWritableOnce ? false : this.isWritable;

    if ('filteringWeight' in options) this.setFilteringWeight(options.filteringWeight);
    else this.setFilteringWeight(AUTO_FILTERING_WEIGHT);

    if (options.hasOwnProperty('default')) {
      this.hasDefault = true;
      this.default = options.default;
    }

    if (options.hasOwnProperty('to')) {
      this.isPopulable = true;
      this._to = options.to;
      this._toKey = options.toKey;
      this._fromKey = options.fromKey;

      if (options.hasOwnProperty('through')) {
        this._through = options.through;
        this.throughKey = options.throughKey;
        this.otherThroughKey = options.otherThroughKey;
        if (!this.throughKey) throw new Error('ManyToMany relation defined without a `throughKey`');
        if (!this.otherThroughKey) throw new Error('ManyToMany relation defined without a `otherThroughKey`');
      }
    }
  }

  setFilteringWeight(weight) {
    if (weight === AUTO_FILTERING_WEIGHT) {
      this.setFilteringWeight(this.isPrimaryKey ? MAX_FILTERING_WEIGHT : MIN_FILTERING_WEIGHT);
    } else {
      if (!Restypie.Utils.isValidNumber(weight)) {
        throw new Error(`filteringWeight must be a valid number, got ${weight}`);
      }
      if (weight < MIN_FILTERING_WEIGHT || weight > MAX_FILTERING_WEIGHT) {
        throw new Error(`filteringWeight must be at least ${MIN_FILTERING_WEIGHT} and ${MAX_FILTERING_WEIGHT} at most`);
      }
      this._filteringWeight = weight;
    }
  }

  /**
   * Checks whether or not the field is present, meaning not `null`, nor `undefined`.
   *
   * @method isPresent
   * @param {*} value
   * @return {Boolean}
   */
  isPresent(value) {
    return !Restypie.Utils.isNone(AbstractField.toJavascriptValue(value));
  }

  /**
   * Validates that `value` `isPresent()`.
   *
   * **Throws:**
   * - `Restypie.TemplateErrors.Missing`: If the field is required but `null` of `undefined`.
   *
   * @method validatePresence
   * @param {*} value
   * @return {Boolean}
   */
  validatePresence(value) {
    let isPresent = this.isPresent(value);
    if (this.isRequired && !isPresent) throw new Restypie.TemplateErrors.Missing({ key: this.key, value });
    return isPresent;
  }

  /**
   * Turns `value` into its internal value.
   *
   * @method hydrate
   * @param {*} value
   * @return {*}
   */
  hydrate(value) {
    value = AbstractField.toJavascriptValue(value);
    if (!this.isPresent(value) && this.hasDefault) value = this.default;
    return value;
  }

  /**
   * Turns `value` into its public value.
   *
   * @method dehydrate
   * @param {*} value
   * @return {*} value
   */
  dehydrate(value) {
    return value;
  }

  /**
   * Validates `value` and provides a list of validation errors.
   *
   * @method validate
   * @param {*} value
   */
  validate() {
    return true;
  }

  /**
   * Returns the supported operator that corresponds to `operatorName`, if any.
   *
   * @method getOperatorByName
   * @param {String} operatorName
   * @return {Restypie.Operators.AbstractOperator | undefined}
   */
  getOperatorByName(operatorName) {
    for (let operator of this.supportedOperators) {
      if (operator.stringName === operatorName) return operator;
    }
  }

  static get AUTO_FILTERING_WEIGHT() { return AUTO_FILTERING_WEIGHT; }
  static get MAX_FILTERING_WEIGHT() { return MAX_FILTERING_WEIGHT; }
  static get MIN_FILTERING_WEIGHT() { return MIN_FILTERING_WEIGHT; }

  /**
   * Turns `"null"` and `"undefined"` into `null` and `undefined`, otherwise lets `value` untouched.
   *
   * @method toJavascriptValue
   * @static
   * @param {*} value
   * @return {*}
   */
  static toJavascriptValue(value) {
    return value === 'null' ? null :
      value === 'undefined' ? undefined :
        value;
  }
};
