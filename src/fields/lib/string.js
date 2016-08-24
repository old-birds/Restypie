'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let _ = require('lodash');

let Restypie = require('../../');

/***********************************************************************************************************************
 * @namespace Restypie.Fields
 * @class StringField
 * @extends Restypie.Fields.AbstractField
 * @constructor
 * @param {String} key
 * @param {Object} options
 * @param {Number} [options.minLength=-Infinity] Minimal length for the field to be valid.
 * @param {Number} [options.maxLength=Infinity] Maximal length for the field to be valid.
 * @param {Number} [options.lengthRange] Convenience shortcut for `minLength` and `maxLength`.
 * @param {RegExp} [options.pattern] Field must match pattern to be valid.
 **********************************************************************************************************************/
class StringField extends Restypie.Fields.AbstractField {

  /**
   * @attribute displayType
   * @type String
   * @value string
   */
  get displayType() { return 'string'; }

  get optionsProperties() { return ['minLength', 'maxLength', 'pattern']; }

  get supportedOperators() {
    return [
      Restypie.Operators.Eq,
      Restypie.Operators.Gt,
      Restypie.Operators.Gte,
      Restypie.Operators.Lt,
      Restypie.Operators.Lte,
      Restypie.Operators.In,
      Restypie.Operators.Nin,
      Restypie.Operators.Ne
    ];
  }

  /**
   * @constructor
   */
  constructor(key, options) {
    super(key, options);
    let range = options.lengthRange || [options.minLength, options.maxLength];
    let min = parseFloat(range[0]);
    let max = parseFloat(range[1]);
    if (Restypie.Utils.isValidNumber(min)) this.minLength = min;
    else this.minLength = -Infinity;
    if (Restypie.Utils.isValidNumber(max)) this.maxLength = max;
    else this.maxLength = Infinity;
    if (_.isRegExp(options.pattern)) this.pattern = options.pattern;

    if (Array.isArray(options.enum)) {
      options.enum.map(this.hydrate, this);
      this.enum = options.enum;
    }
  }

  /**
   * Casts `value` into a `String` if its type is `String` or `Number`.
   *
   * **Throws:**
   * - `Restypie.TemplateErrors.BadType`: If 'value' is not a `String` or a `Number`.
   *
   * @method hydrate
   * @param {*} value
   * @return {String}
   */
  hydrate(value) {
    value = super.hydrate(value);
    if (_.isUndefined(value)) return '';
    if (_.isNull(value)) return null;
    if (_.isString(value)) return value;
    if (Restypie.Utils.isValidNumber(value)) return value.toString();
    throw new Restypie.TemplateErrors.BadType({ key: this.key, value, expected: this.displayType });
  }

  /**
   * Casts `value` into a `String` if its type is `String`, `Number` or `undefined`.
   *
   * **Throws:**
   * - `Restypie.TemplateErrors.BadType`: If 'value' is not a `String`, `Number`, `undefined` or `null`.
   *
   * @method dehydrate
   * @param {*} value
   * @return {String}
   */
  dehydrate(value) {
    value = super.dehydrate(value);
    if (_.isUndefined(value)) return '';
    if (_.isNull(value)) return null;
    if (_.isString(value)) return value;
    if (Restypie.Utils.isValidNumber(value)) return value.toString();
    throw new Restypie.TemplateErrors.BadType({ key: this.key, value, expected: this.displayType });
  }

  /**
   * Validates that `value` fulfills the `options` requirements, such as `minLength`, ...
   *
   * **Throws:**
   * - `Restypie.TemplateErrors.OutOfRange`: If 'value' is not within `minLength` and `maxLength`.
   * - `Restypie.TemplateErrors.BadPattern`: If 'value' doesn't match `pattern`.
   *
   * @param {String} value
   */
  validate(value) {
    if (Array.isArray(this.enum) && !_.contains(this.enum, value)) {
      throw new Restypie.TemplateErrors.NotInEnum({ key: this.key, value, expected: this.enum });
    }

    if (value.length < this.minLength || value.length > this.maxLength) {
      throw new Restypie.TemplateErrors.OutOfRange({ key: this.key, value, min: this.minLength, max: this.maxLength });
    }

    if (this.pattern && !this.pattern.test(value)) {
      throw new Restypie.TemplateErrors.BadPattern({ key: this.key, value, expected: this.pattern.toString() });
    }
  }

}

module.exports = StringField;