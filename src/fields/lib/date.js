'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let _ = require('lodash');

let Restypie = require('../../../');

const DEFAULT_ISO_REGEX = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;
const TIMESTAMP_REGEX = /^\d{1,16}$/;

const MIN_TIMESTAMP = -8640000000000000;
const MAX_TIMESTAMP = 8640000000000000;

/***********************************************************************************************************************
 * Date field.
 *
 * @namespace Restypie.Fields
 * @class DateField
 * @extends Restypie.Fields.AbstractField
 * @constructor
 * @param {String} key
 * @param {Object} options
 * @param {RegExp} [options.ISOFormat = Strict/full ISO date] ISO format to validate values against.
 * @param {RegExp} [options.min = -8640000000000000]
 * @param {RegExp} [options.max = 8640000000000000]
 **********************************************************************************************************************/
module.exports = class DateField extends Restypie.Fields.AbstractField {

  /**
   * @attribute displayType
   * @type String
   * @value date
   */
  get displayType() { return 'date'; }

  get optionsProperties() { return ['ISOFormat', 'min', 'max']; }

  get supportedOperators() {
    return [
      Restypie.Operators.Eq,
      Restypie.Operators.Gt,
      Restypie.Operators.Gte,
      Restypie.Operators.Lt,
      Restypie.Operators.Lte
    ];
  }

  /**
   * @constructor
   */
  constructor(key, options) {
    super(key, options);

    options = options || {};

    this.ISOFormat = _.isRegExp(options.ISOFormat) ? options.ISOFormat : DEFAULT_ISO_REGEX;

    let min = +options.min;
    if (Restypie.Utils.isValidNumber(min) && min >= MIN_TIMESTAMP) this.min = min;
    else this.min = MIN_TIMESTAMP;

    let max = +options.max;
    if (Restypie.Utils.isValidNumber(max) && max <= MAX_TIMESTAMP) this.max = max;
    else this.max = MAX_TIMESTAMP;
  }

  /**
   * Turns `value` into a `Date` if it's either a `Date`, an ISO formatted string or a timestamp.
   *
   * **Throws:**
   * - `Restypie.TemplateErrors.BadType`: If `value` cannot be converted to an ISO date.
   *
   * @method hydrate
   * @param value
   * @return {Date}
   */
  hydrate(value) {
    value = super.hydrate(value);
    if (_.isDate(value)) return value;
    if (this.ISOFormat.test(value)) return new Date(value);
    if (TIMESTAMP_REGEX.test(value)) return new Date(parseInt(value, 10));
    throw new Restypie.TemplateErrors.BadType({ key: this.key, value, expected: this.displayType });
  }

  /**
   * Makes sure that the date is within the range.
   *
   * **Throws:**
   * - `Restypie.TemplateErrors.OutOfRange`: If `value` is not in the valid dates range.
   *
   * @method validate
   * @param {Date} value
   */
  validate(value) {
    value = +value;
    if (value < this.min || value > this.max) {
      throw new Restypie.TemplateErrors.OutOfRange({ key: this.key, min: new Date(this.min), max: new Date(this.max) });
    }
  }

  /**
   * Renders `value` as an ISO datetime string.
   *
   * @method dehydrate
   * @param {Date} value
   * @return {String}
   */
  dehydrate(value) {
    return this.isPresent(value) ? new Date(value).toISOString() : value;
  }

  static get DEFAULT_ISO_FORMAT() { return DEFAULT_ISO_REGEX; }
  static get MIN_TIMESTAMP() { return MIN_TIMESTAMP; }
  static get MAX_TIMESTAMP() { return MAX_TIMESTAMP; }

};