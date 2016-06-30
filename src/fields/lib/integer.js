'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let _ = require('lodash');

let Restypie = require('../../');

const INTEGER_REGEX = /^-?\d+$/;

/***********************************************************************************************************************
 * Integer field.
 *
 * @namespace Restypie.Fields
 * @class IntegerField
 * @extends Restypie.Fields.AbstractNumberField
 * @constructor
 * @param {String} key
 * @param {Object} options
 * @param {Number} [options.min]
 * @param {Number} [options.max]
 * @param {Number[]} [options.range] Convenience shortcut for `options.min` and `options.max`.
 **********************************************************************************************************************/
module.exports = class IntegerField extends Restypie.Fields.AbstractNumberField {

  get displayType() { return 'integer'; }

  constructor(key, options) {
    super(key, options);

    if (Array.isArray(options.enum)) {
      options.enum.map(this.hydrate, this);
      this.enum = options.enum;
    }
  }

  /**
   * Casts `value` into an integer if it represents any positive or negative integer. Only pure integers are valid,
   * floats are not.
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
    if (_.isNull(value)) return value;
    if (INTEGER_REGEX.test(value)) return parseInt(value, 10);
    throw new Restypie.TemplateErrors.BadType({ key: this.key, value, expected: this.displayType });
  }

  validate(value) {
    if (Array.isArray(this.enum) && !_.contains(this.enum, value)) {
      throw new Restypie.TemplateErrors.NotInEnum({ key: this.key, value, expected: this.enum });
    }

    super.validate(value);
  }
};