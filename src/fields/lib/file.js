'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let fs = require('fs');
let path = require('path');
let OS = require('os');
let UUID = require('node-uuid');

let Restypie = require('../../../');

/***********************************************************************************************************************
 * @namespace Restypie.Fields
 * @class FileField
 * @extends Restypie.Fields.AbstractField
 * @constructor
 * @param {String} key
 * @param {Object} options
 * @param {Number} [options.maxSize=Infinity] In bytes, the maximal size the file can have
 **********************************************************************************************************************/
module.exports = class FileField extends Restypie.Fields.AbstractField {

  /**
   * @attribute displayType
   * @type String
   * @value file
   */
  get displayType() { return 'file'; }

  get optionsProperties() { return ['maxSize']; }

  /**
   * @constructor
   */
  constructor(key, options) {
    super(key, options);

    options = options || {};

    if (Restypie.Utils.isValidNumber(options.maxSize) && options.maxSize > 0) this.maxSize = options.maxSize;
    else this.maxSize = Infinity;
  }

  /**
   * Used by the default class to write on the file system. By default returns a path in the tmp directory. Override
   * this method to save the file in a different directory.
   *
   * @method buildFilePath
   * @param {Object} file
   * @return {String}
   */
  buildFilePath(file) {
    return path.join(OS.tmpdir(), `restypie_${UUID.v4()}_${path.basename(file.name || '')}`);
  }

  /**
   * Creates a write stream to pipe the file. This method must attach the `path` property to `file`.
   *
   * @method writeStream
   * @param {Object} file
   * @return {WritableStream}
   */
  writeStream(file) {
    file.path = this.buildFilePath(file);
    return fs.createWriteStream(file.path);
  }

  /**
   * Removes the file from its storage.
   *
   * @method unlink
   * @async
   * @param {Object} file
   * @return {Promise}
   */
  unlink(file) {
    return new Promise(function (resolve, reject) {
      return fs.unlink(file.path, function (err) {
        if (err) return reject(err);
        return resolve();
      });
    });
  }

  /**
   * Validates that `file.size` does not exceed `maxSize`.
   *
   * **Throws:**
   * - `Restypie.TemplateErrors.OutOfRange:` If the file is too big.
   *
   * @param {Object} file
   */
  validateSize(file) {
    if (file.size > this.maxSize) {
      throw new Restypie.TemplateErrors.OutOfRange({ key: this.key, value: file.size, max: this.maxSize });
    }
  }

};