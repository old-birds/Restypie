'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let _ = require('lodash');

let Restypie = require('../../');

/***********************************************************************************************************************
 * Abstract serializer class.
 *
 * @namespace Restypie.Serializers
 * @class JSONSerializer
 * @extends Restypie.Serializers.AbstractSerializer
 * @constructor
 **********************************************************************************************************************/
module.exports = class JSONSerializer extends Restypie.Serializers.AbstractSerializer {

  static serialize(content) {
    if (_.isPlainObject(content)) return Promise.resolve(content);

    if (_.isString(content)) {
      try {
        return Promise.resolve(JSON.parse(content));
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject(new Error('Cannot parse JSON'));
  }

  static get mimeType() { return 'application/json'; }
  static get aliases() { return ['json']; }
};