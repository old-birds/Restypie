'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let Restypie = require('../../../');

const FLOAT_REGEX = /^-?\d+(\.\d+)?$/;

/***********************************************************************************************************************
 * Float number field.
 *
 * @namespace Restypie.Fields
 * @class FloatField
 * @extends Restypie.Fields.AbstractNumberField
 * @constructor
 * @param {String} key
 * @param {Object} options
 * @param {Number} [options.min]
 * @param {Number} [options.max]
 * @param {Number[]} [options.range] Convenience shortcut for `options.min` and `options.max`.
 **********************************************************************************************************************/
module.exports = class FloatField extends Restypie.Fields.AbstractNumberField {

  /**
   * @attribute displayType
   * @type String
   * @value float
   */
  get displayType() { return 'float'; }

  /**
   * Casts `value` into an integer if it represents any positive or negative float.
   *
   * **Throws:**
   * - `Restypie.TemplateErrors.BadType`: If `value` cannot be casted.
   *
   * @method hydrate
   * @param {*} value
   * @return {Number}
   */
  hydrate(value) {
    value = super.hydrate(value);
    if (FLOAT_REGEX.test(value)) return parseFloat(value);
    throw new Restypie.TemplateErrors.BadType({ key: this.key, value, expected: this.displayType });
  }

};