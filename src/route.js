'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let _ = require('lodash');

let Restypie = require('./');

const DEFAULT_METHOD = Restypie.Methods.GET;

/***********************************************************************************************************************
 *
 *
 * @namespace Restypie
 * @class Route
 * @constructor
 * @param {Object} context An object containing the objects the route needs to access to.
 **********************************************************************************************************************/
module.exports = class Route {

  /**
   * @property path
   * @type String
   * @default null
   */
  get path() { return null; }

  /**
   * @property method
   * @type Symbol
   * @default Restypie.Methods.GET
   */
  get method() { return DEFAULT_METHOD; }

  /**
   * @property handler
   * @type Function
   * @default null
   */
  get handler() { return null; }

  /**
   * The context that was given to the constructor.
   *
   * @property context
   * @type *
   */
  //get context(){}



  /**
   * @constructor
   */
  constructor(context) {
    Object.defineProperty(this, 'context', { get() { return context; } });

    if (!_.isString(this.path)) throw new TypeError(`Object ${this} requires a string "path"`);
    if (!_.isFunction(this.handler)) throw new TypeError(`Property "handler" should be a function`);
    if (!Restypie.Methods.isSupportedMethod(this.method)) {
      throw new TypeError(`Property "method" should be a valid http method from 'Restypie.Methods'`);
    }

    this._handlers = [];
    this._registerHandler(this.createBundleHandler());
    this._registerHandler(this.handler);
    Object.defineProperty(this, 'handlers', { get() { return this._handlers; } });
  }



  /**
   * Middlewares that creates the instance of `bundle` to be passed to next handlers.
   *
   * @method createBundleHandler
   */
  createBundleHandler() {
    switch (Restypie.middlewareType) {

      case Restypie.MIDDLEWARE_TYPES.EXPRESS:
        return function (req, res, next) {
          req.bundle = new Restypie.Bundle({ req, res });
          return next();
        };

      case Restypie.MIDDLEWARE_TYPES.KOA:
        return function *() {
          this.request.params = this.params; // Copy params so that we don't have to parse them
          this.state.bundle = new Restypie.Bundle({ req: this.request, res: this.response });
          yield;
        };
    }
  }


  /**
   * Registers a handler.
   *
   * @method _registerHandler
   * @param {Function} handler
   * @private
   */
  _registerHandler(handler) {
    handler = handler.bind(this);

    switch (Restypie.middlewareType) {

      case Restypie.MIDDLEWARE_TYPES.EXPRESS:
        if (handler.length === 1) {
          this._handlers.push(function (req, res, next) { return handler(req.bundle, next); });
        } else {
          this._handlers.push(handler);
        }
        break;

      case Restypie.MIDDLEWARE_TYPES.KOA:
        this._handlers.push(function *() { return yield handler(this.state.bundle); });
        break;
    }


  }

};