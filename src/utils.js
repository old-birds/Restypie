'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
const _ = require('lodash');

/***********************************************************************************************************************
 * @namespace Restypie
 * @class Utils
 **********************************************************************************************************************/
const Utils = module.exports = {

  /**
   * Checks whether or not `Child` is a subclass of `Parent`.
   *
   * **Throws:**
   * - `TypeError`: If `Child` is not a subclass of `Parent` and `shouldThrow` is set to `true`
   *
   * @method isSubclassOf
   * @static
   * @param {constructor} Child
   * @param {constructor} Parent
   * @param {Boolean} [shouldThrow]
   * @return {Boolean}
   */
  isSubclassOf(Child, Parent, shouldThrow) {
    let isSubclass = !this.isNone(Child) && Parent.isPrototypeOf(Child);
    if (!isSubclass && shouldThrow === true) {
      throw new TypeError(`Object ${Child} should be a "${Parent.name}" subclass`);
    }
    return !!isSubclass;
  },

  assertIsSubclassOf(Child, Parent) {
    if (!Utils.isSubclassOf(Child, Parent)) {
      throw new TypeError(`Object ${Child} should be a "${Parent.name}" subclass`);
    }
  },

  /**
   * Checks whether or not `obj` is an instance of `Constructor`.
   *
   * **Throws:**
   * - `TypeError`: If `obj` is not an instance of `Constructor` and `shouldThrow` is set to `true`.
   *
   * @method isInstanceOf
   * @static
   * @param {Object} obj
   * @param {constructor} Constructor
   * @param {Boolean} [shouldThrow]
   * @return {Boolean}
   */
  isInstanceOf(obj, Constructor, shouldThrow) {
    let isInstance = Constructor && Constructor.prototype && (obj instanceof Constructor);
    if (!isInstance && shouldThrow === true) {
      throw new TypeError(`Object ${obj} should be a "${Constructor.name}" instance`);
    }
    return !!isInstance;
  },

  assertIsInstanceOf(obj, Constructor) {
    if (!Utils.isInstanceOf(obj, Constructor)) {
      throw new TypeError(`Object ${obj} should be a "${Constructor.name}" instance`);
    }
  },

  /**
   * To be used in an abstract class constructor. Will throw if the class is instantiated.
   *
   * @method forceAbstract
   * @static
   * @param {Object} context
   * @param {constructor} Constructor An abstract class.
   *
   * @example
   * ```javascript
   * class Abstract {
   *   constructor(options) {
   *     Utils.forceAbstract(this, Abstract);
   *     this.options = options;
   *   }
   * }
   *
   * class Child extends Abstract {
   *   constructor(options, otherParameter) {
   *     super(options);
   *     this.otherParameter = otherParameter;
   *   }
   * }
   *
   * new Child({}, 'foo'); // Returns a new instance of Child
   * new Abstract({}); // Throws TypeError: Class Abstract is abstract and cannot be instantiated
   * ```
   */
  forceAbstract(context, Constructor) {
    if (context.constructor === Constructor) {
      throw new TypeError(`Class ${Constructor.name} is abstract and cannot be instantiated`);
    }
  },

  /**
   * Forces the class and its subclasses to be static (not instantiable).
   *
   * @method forceStatic
   * @static
   * @param {Object} context
   * @param {constructor} Constructor A static class.
   *
   * @example
   * ```javascript
   * class Static {
   *   constructor(options) {
   *     Utils.forceStatic(this, Static);
   *   }
   *   static sayHello() {
   *     console.log('Hello');
   *   }
   * }
   *
   * class Child extends Static {
   * }
   *
   * new Static(); // Throws TypeError: Class Static is static and cannot be instantiated
   * new Child(); // Throws TypeError: Class Child is static and cannot be instantiated
   * Static.sayHello(); // Hello
   * Child.sayHello(); // Hello
   * ```
   */
  forceStatic(context, Constructor) {
    if (context.constructor === Constructor || Utils.isSubclassOf(context.constructor, Constructor)) {
      throw new TypeError(`Class ${Constructor.name} is static and cannot be instantiated`);
    }
  },

  /**
   * Returns `true` if `value` is `null` or `undefined`. Returns `false` for any other value.
   *
   * @method isNone
   * @static
   * @param {*} value
   * @return {Boolean}
   *
   * @example
   * ```javascript
   * Utils.isNone(); // true
   * Utils.isNone(null); // true
   * Utils.isNone(undefined); // true
   * Utils.isNone(NaN); // false
   * Utils.isNone(''); // false
   * Utils.isNone(0); // false
   * Utils.isNone(false); // false
   * Utils.isNone([]); // false
   * Utils.isNone({}); // false
   * ```
   */
  isNone(value) {
    return _.isUndefined(value) || _.isNull(value);
  },

  /**
   * Checks whether or not `value` is a valid number as well as not `NaN`.
   *
   * @method isValidNumber
   * @static
   * @param {*} value
   * @return {Boolean}
   *
   * @example
   * ```javascript
   * Utils.isValidNumber(3); // true
   * Utils.isValidNumber(3.2); // true
   * Utils.isValidNumber('3'); // false
   * Utils.isValidNumber(NaN); // false
   * ```
   */
  isValidNumber(value) {
    return _.isNumber(value) && !isNaN(value);
  },

  /**
   * Checks whether of not `obj` is returning a promise.
   *
   * @method didReturnAPromise
   * @static
   * @param {*} obj
   * @return {Boolean}
   *
   * @example
   * ```javascript
   * function foo() { return 'foo'; }
   * function bar() { return null; }
   * function fooBar() { return Promise.resolve(); }
   *
   * Utils.doesReturnAPromise(foo())// false
   * Utils.doesReturnAPromise(bar())// false
   * Utils.doesReturnAPromise(fooBar())// true
   * ```
   */
  didReturnAPromise(obj) {
    let then;
    try { then = obj.then; } catch (ex) {}
    return typeof then === 'function';
  },

  /**
   * Returns a function that will throw when called. Useful to ensure certain methods are overridden.
   *
   * @method missingImplementation
   * @static
   * @param {String} name
   */
  missingImplementation(name) {
    throw new Error(`${this && this.constructor && this.constructor.name} must implement ${name}()`);
  },


  makeArray(value) {
    if (Array.isArray(value)) return value;
    if (_.isUndefined(value)) return [];
    return [value];
  },

  addIfNotInclude(array, item) {
    if (!_.includes(array, item)) {
      array.push(item);
    }
    return array;
  }

};
