'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let Restypie = require('../../');

/***********************************************************************************************************************
 * @namespace Restypie.Fields
 * @class BooleanField
 * @extends Restypie.Fields.AbstractField
 * @constructor
 **********************************************************************************************************************/
module.exports = class BooleanField extends Restypie.Fields.AbstractField {

  /**
   * @attribute displayType
   * @type String
   * @value boolean
   */
  get displayType() { return 'boolean'; }

  get supportedOperators() { return [Restypie.Operators.Eq, Restypie.Operators.Ne]; }

  /**
   * Casts `value` into a Boolean.
   *
   * **Throws:**
   * - `Restypie.TemplateErrors.BadType`: If 'value' is not `true`, `false`, `"true"` or `"false"`.
   *
   * @method hydrate
   * @param {*} value
   * @return {Boolean}
   */
  hydrate(value) {
    value = super.hydrate(value);
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    throw new Restypie.TemplateErrors.BadType({ key: this.key, value, expected: this.displayType });
  }

  /**
   * Casts `value` into a Boolean
   *
   * @method dehydrate
   * @param {*} value
   * @return {Boolean}
   */
  dehydrate(value) {
    return !!super.dehydrate(value);
  }

};
