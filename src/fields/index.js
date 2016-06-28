'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let Restypie = require('../');

/***********************************************************************************************************************
 * @namespace Restypie
 * @class Fields
 **********************************************************************************************************************/
module.exports = {

  /**
   * Tries to find a match given a string (ie "int" => Integer), a primitive constructor. If `type` is an AbstractField
   * subclass, it is returned directly.
   *
   * **Throws:**
   * `TypeError`: If no match can be found
   *
   * @method match
   * @static
   * @param {constructor | String} type
   * @return constructor
   */
  match(type) {
    if (Restypie.Utils.isSubclassOf(type, this.AbstractField)) return type;
    if (type === String) return this.StringField;
    if (type === Number) return this.FloatField;
    if (type === Date) return this.DateField;
    if (type === Boolean) return this.BooleanField;
    if (/^int(eger)?$/i.test(type)) return this.IntegerField;
    if (/^float$/i.test(type)) return this.FloatField;
    if (/^file$/i.test(type)) return this.FileField;
    if (/^bool(ean)?$/i.test(type)) return this.BooleanField;
    if (/^any$/i.test(type)) return this.AnyField;

    throw new TypeError(`Value ${type} does not match any valid type`);
  },

  get AbstractField() { return require('./lib/abstract-field'); },
  get AbstractNumberField() { return require('./lib/abstract-number'); },
  get StringField() { return require('./lib/string'); },
  get IntegerField() { return require('./lib/integer'); },
  get FloatField() { return require('./lib/float'); },
  get FileField() { return require('./lib/file'); },
  get AbstractRelationField() { return require('./lib/abstract-relation'); },
  get ToOneField() { return require('./lib/to-one'); },
  get ToManyField() { return require('./lib/to-many'); },
  get DateField() { return require('./lib/date'); },
  get BooleanField() { return require('./lib/boolean'); },
  get AnyField() { return require('./lib/any'); }
};