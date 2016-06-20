'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let Restypie = require('../../../');

/***********************************************************************************************************************
 * Abstract class for Number fields.
 *
 * @namespace Restypie.Fields
 * @class AbstractNumberField
 * @extends Restypie.Fields.AbstractField
 * @constructor
 * @param {String} key
 * @param {Object} options
 * @param {Number} [options.min=-Infinity]
 * @param {Number} [options.max=Infinity]
 * @param {Number[]} [options.range] Convenience shortcut for `options.min` and `options.max`.
 **********************************************************************************************************************/
module.exports = class AbstractNumberField extends Restypie.Fields.AbstractField {

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

  get optionsProperties() { return ['min', 'max']; }

  /**
   * @attribute displayType
   * @type String
   * @value number
   */
  get displayType() { return 'number'; }

  /**
   * @constructor
   */
  constructor(key, options) {
    super(key, options);

    Restypie.Utils.forceAbstract(this, AbstractNumberField);

    let range = options.range || [options.min, options.max];
    let min = parseFloat(range[0]);
    let max = parseFloat(range[1]);
    if (Restypie.Utils.isValidNumber(min)) this.min = min;
    else this.min = -Infinity;
    if (Restypie.Utils.isValidNumber(max)) this.max = max;
    else this.max = Infinity;
  }

  /**
   * Validates that `value` fulfills the `options` requirements, such as `min`, ...
   *
   * **Throws:**
   * - `Restypie.TemplateErrors.OutOfRange`: If `value` is not within `min` and `max`
   *
   * @method validate
   * @param {Number} value
   */
  validate(value) {
    if (value < this.min || value > this.max) {
      throw new Restypie.TemplateErrors.OutOfRange({ key: this.key, value, min: this.min, max: this.max });
    }
  }

};