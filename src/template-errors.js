'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let _ = require('lodash');

let Restypie = require('../');

class AbstractError extends Restypie.RestErrors.AbstractRestError {
  get name() { return this.constructor.name; }
  get statusCode() { return null; }
  constructor(meta) {
    let message = '';
    if (_.isString(meta)) {
      message = meta;
      meta = null;
    }
    super(message, meta);

    Restypie.Utils.forceAbstract(this, AbstractError);

    if (!_.isNumber(this.statusCode)) throw new TypeError('statusCode should be a number');
    if (_.isPlainObject(meta)) this.message = this.constructor.template(meta);
  }

  static template(meta) {
    return JSON.stringify(meta);
  }
}

class AbstractBadRequestError extends AbstractError {
  get statusCode() { return Restypie.Codes.BadRequest; }
  constructor(meta) {
    super(meta);
    Restypie.Utils.forceAbstract(this, AbstractBadRequestError);
  }
}

class AbstractForbiddenError extends AbstractError {
  get statusCode() { return Restypie.Codes.Forbidden; }
  constructor(meta) {
    super(meta);
    Restypie.Utils.forceAbstract(this, AbstractForbiddenError);
  }
}


/***********************************************************************************************************************
 * @namespace Restypie
 * @class TemplateErrors
 **********************************************************************************************************************/
module.exports = {

  /**
   * Allow customizing an error template.
   *
   * @method overrideTemplate
   * @static
   * @param {constructor} error A subclass of `Restypie.TemplateErrors.AbstractError`
   * @param {Function} templateFunction A `meta` argument (Object) will be passed to that function.
   */
  overrideTemplate(error, templateFunction) {
    Restypie.Utils.isSubclassOf(error, AbstractError, true);
    Restypie.Utils.isInstanceOf(templateFunction, Function, true);
    error.template = templateFunction;
  },

  /**
   * Abstract class for errors.
   *
   * @property AbstractError
   * @type constructor
   * @static
   * @extends Restypie.RestError
   * @constructor
   */
  AbstractError: AbstractError,

  /**
   * Abstract class for validation errors.
   *
   * @property AbstractBadRequestError
   * @type constructor
   * @static
   * @extends Restypie.TemplateErrors.AbstractError
   * @constructor
   */
  AbstractBadRequestError: AbstractBadRequestError,

  /**
   * Abstract class for authorization errors.
   *
   * @property AbstractForbiddenError
   * @type constructor
   * @static
   * @extends Restypie.TemplateErrors.AbstractError
   * @constructor
   */
  AbstractForbiddenError: AbstractForbiddenError,

  /**
   * Path is required but missing.
   *
   * @property Missing
   * @type constructor
   * @static
   * @extends Restypie.TemplateErrors.AbstractBadRequestError
   * @constructor
   */
  Missing: class MissingError extends AbstractBadRequestError {
    static template(meta) {
      return `Path "${meta.key}" is required.`;
    }
  },

  /**
   * Path is out of range.
   *
   * @property OutOfRange
   * @type constructor
   * @static
   * @extends Restypie.TemplateErrors.AbstractForbiddenError
   * @constructor
   */
  OutOfRange: class OutOfRangeError extends AbstractForbiddenError {
    static template(meta) {
      let message = `Path "${meta.key}" must be`;
      let hasMin = _.isNumber(meta.min);
      let hasMax = _.isNumber(meta.max);
      if (hasMin) message += ` greater than "${meta.min}"`;
      if (hasMin && hasMax) message += ' and';
      if (hasMax) message += ` smaller than "${meta.max}"`;
      message += `, got "${meta.value}".`;
      return message;
    }
  },

  /**
   * Path doesn't match the required type.
   *
   * @property BadType
   * @type constructor
   * @static
   * @extends Restypie.TemplateErrors.AbstractBadRequestError
   * @constructor
   */
  BadType: class BadTypeError extends AbstractBadRequestError {
    static template(meta) {
      return `Expected path "${meta.key}" to be of type "${meta.expected}", got "${meta.type || typeof meta.value}".`;
    }
  },

  /**
   * Path doesn't match the required pattern.
   *
   * @property BadPattern
   * @type constructor
   * @static
   * @extends Restypie.TemplateErrors.AbstractBadRequestError
   * @constructor
   */
  BadPattern: class BadPatternError extends AbstractBadRequestError {
    static template(meta) {
      return `Path "${meta.key}" does not match pattern "${meta.expected.toString()}"`;
    }
  },

  /**
   * Expected format is not supported.
   *
   * @property UnsupportedFormat
   * @type constructor
   * @static
   * @extends Restypie.TemplateErrors.AbstractError
   * @constructor
   */
  UnsupportedFormat: class UnsupportedFormatError extends AbstractError {
    get statusCode() { return Restypie.Codes.NotAcceptable; }
    static template(meta) {
      return `Expected format is not supported ; should be one of ${meta.expected.join(', ')} ; got "${meta.value}"`;
    }
  },

  /**
   * The resource could not be found.
   *
   * @property ResourceNotFound
   * @type constructor
   * @static
   * @extends Restypie.TemplateErrors.AbstractError
   * @constructor
   */
  ResourceNotFound: class ResourceNotFoundError extends AbstractError {
    get statusCode() { return Restypie.Codes.NotFound; }
    static template(meta) {
      return `Resource with identifier "${meta.pk}" could not be found`;
    }
  },

  /**
   * The path could not be found in the resource's schema.
   *
   * @property UnknownPath
   * @type constructor
   * @static
   * @extends Restypie.TemplateErrors.AbstractForbiddenError
   * @constructor
   */
  UnknownPath: class UnknownPathError extends AbstractForbiddenError {
    static template(meta) {
      return `Path "${meta.key}" could not be found on this resource`;
    }
  },

  /**
   * The path is not writable.
   *
   * @property NotWritable
   * @type constructor
   * @static
   * @extends Restypie.TemplateErrors.AbstractForbiddenError
   * @constructor
   */
  NotWritable: class NotWritableError extends AbstractForbiddenError {
    static template(meta) {
      return `Path "${meta.key}" cannot be written, got "${meta.value}"`;
    }
  },

  /**
   * The path can only be written once.
   *
   * @property NotUpdatable
   * @type constructor
   * @static
   * @extends Restypie.TemplateErrors.AbstractForbiddenError
   * @constructor
   */
  NotUpdatable: class NotUpdatableError extends AbstractForbiddenError {
    static template(meta) {
      return `Path "${meta.key}" cannot be updated, got "${meta.value}"`;
    }
  },

  /**
   * The path cannot be filtered.
   *
   * @property NotFilterable
   * @type constructor
   * @static
   * @extends Restypie.TemplateErrors.AbstractForbiddenError
   * @constructor
   */
  NotFilterable: class NotFilterableError extends AbstractForbiddenError {
    static template(meta) {
      return `Path "${meta.key}" cannot be filtered`;
    }
  },

  /**
   * The path cannot be populated.
   *
   * @property NotPopulable
   * @type constructor
   * @static
   * @extends Restypie.TemplateErrors.AbstractForbiddenError
   * @constructor
   */
  NotPopulable: class NotPopulableError extends AbstractForbiddenError {
    static template(meta) {
      return `Path "${meta.key}" cannot be populated`;
    }
  },

  /**
   * The path is not a valid value for the enum.
   *
   * @property NotInEnum
   * @type constructor
   * @static
   * @extends Restypie.TemplateErrors.AbstractBadRequestError
   * @constructor
   */
  NotInEnum: class NotInEnumError extends AbstractBadRequestError {
    static template(meta) {
      return `Path "${meta.key}" must be one of "${meta.expected.join(', ')}", got "${meta.value}"`;
    }
  },

  /**
   * The path doesn`t support the operator.
   *
   * @property UnsupportedOperator
   * @type constructor
   * @static
   * @extends Restypie.TemplateErrors.AbstractBadRequestError
   * @constructor
   */
  UnsupportedOperator: class UnsupportedOperatorError extends AbstractBadRequestError {
    static template(meta) {
      return `Path "${meta.key}" does not support operator "${meta.operator}"`;
    }
  },

  /**
   * The operators cannot be mixed.
   *
   * @property NotMixableOperators
   * @type constructor
   * @static
   * @extends Restypie.TemplateErrors.AbstractForbiddenError
   * @constructor
   */
  NotMixableOperators: class NotMixableOperatorsError extends AbstractForbiddenError {
    static template(meta) {
      return `Operators "${meta.operators.join(', ')}" cannot be mixed for path "${meta.key}", please use either one or
       the other`;
    }
  },

  /**
   * The paths have a uniqueness constraint.
   *
   * @property UniquenessConstraintViolation
   * @type constructor
   * @static
   * @extends Restypie.TemplateErrors.AbstractError
   * @constructor
   */
  UniquenessConstraintViolation: class UniqueConstraintViolationError extends AbstractError {
    get statusCode() { return Restypie.Codes.Conflict; }
    static template(meta) {
      meta.keys = meta.keys || {};
      let keys = Object.keys(meta.keys).map(function (key) {
        return key + ' (' + meta.keys[key] + ')';
      });
      return `Path(s) ${keys.join(', ')} must be unique`;
    }
  },

  /**
   * The request is trying to access too many data. It needs more filtering.
   *
   * @property RequestOutOfRange
   * @type constructor
   * @static
   * @extends Restypie.TemplateErrors.AbstractForbiddenError
   * @constructor
   */
  RequestOutOfRange: class RequestOutOfRangeError extends AbstractForbiddenError {
    static template() {
      return `Request is trying to access too many data, try refining your filters`;
    }
  },
  
  
  InconsistentRequest: class InconsistentRequestError extends AbstractBadRequestError {
    static template(meta) {
      let message = `Request is not consistent, values for path "${meta.key}" don't match :` +
        `"${meta.filterValue}" is different than "${meta.bodyValue}".`;
      return message;
    }
  }

};