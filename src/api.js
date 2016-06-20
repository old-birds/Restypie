'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let _ = require('lodash');

let Restypie = require('../');

/***********************************************************************************************************************
 * @namespace Restypie
 * @class API
 * @constructor
 * @param {Object} options
 * @param {express} options.app The express application on which the routes will be attached
 * @param {String} [options.path=""] Prefix path for this API
 **********************************************************************************************************************/
module.exports = class API {

  /**
   * Prefix path for the api, ie "/v1"
   *
   * @property path
   * @type String
   * @writeOnce
   */
  get path() { return this._path; }

  /**
   * The express application on which the routes will be attached
   *
   * @property app
   * @type express
   * @writeOnce
   */
  get app() { return this._app; }

  /**
   *
   * @property isLaunched
   * @type {Boolean}
   * @readOnly
   */
  get isLaunched() { return this._isLaunched; }

  /**
   *
   * @property resources
   * @type {Object}
   */
  get resources() { return this._resources; }


  /**
   * @constructor
   */
  constructor(options) {
    this._isLaunched = false;
    if (options.app) this._app = options.app;
    this._path = options.path || '';
    this._resources = {};
  }


  /**
   * Launches the API.
   *
   * **IMPORTANT** : this method can only be called once
   *
   * @method launch
   */
  launch(app) {
    this._throwIfLaunched();

    app = this._app = app || this._app;
    if (!app) throw new Error('An API requires an express app');

    let apiPath = this._path;
    let resources = this._resources;

    // List routes from all resources
    let routes = Object.keys(resources).reduce(function (acc, resourceName) {
      let resource = resources[resourceName];
      let resourcePath = resource.path;
      return acc.concat(resource.routes.map(function (route) {
        return {
          method: route.method,
          path: Restypie.Url.join('/', apiPath, resourcePath, route.path).replace(/\/$/, ''),
          handlers: route.handlers
        };
      }));
    }, []);

    // Sort the routes and declare them to the app
    Restypie.RoutesSorter
      .sort(routes)
      .forEach(function (route) {
        app[route.method.toLowerCase()](route.path, route.handlers);
      });

    // The API is now launched and couldn't be launched again
    this._isLaunched = true;

    return this;
  }

  /**
   * Register a single resource.
   *
   * @method registerResource
   * @param {String} name
   * @param {Restypie.AbstractCoreResource} Resource
   * @chainable
   */
  registerResource(name, Resource) {
    Restypie.Utils.isSubclassOf(Resource, Restypie.Resources.AbstractCoreResource, true);
    if (this._resources.hasOwnProperty(name)) throw new Error('Cannot have 2 resources with the same name');
    this._resources[name] = new Resource(this);
    return this;
  }

  /**
   * Register several resources.
   *
   * @method registerResources
   * @param { { name: Restypie.AbstractCoreResource } } resources
   * @chainable
   */
  registerResources(resources) {
    if (!_.isPlainObject(resources)) throw new Error('Argument must be an object with named resources');

    let self = this;
    Object.keys(resources).forEach(function (resourceName) {
      self.registerResource(resourceName, resources[resourceName]);
    });
    return this;
  }

  _throwIfLaunched() {
    if (this._isLaunched) throw new Error(`API ${this} can only be launched once`);
  }
};
