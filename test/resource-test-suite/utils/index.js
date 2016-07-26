'use strict';

const formDataToObject = require('form-data-to-object');

class Utils {
  
  static fillMultipartFields(req, obj) {
    obj = formDataToObject.fromObj(obj);

    for (let key of Object.getOwnPropertyNames(obj)) {
      req.field(key, obj[key] + '');
    }
  }
  
}


module.exports = Utils;