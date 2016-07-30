'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
const _ = require('lodash');
const URL = require('url');
const URLValidator = require('valid-url');

let Restypie = require('./');

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
   * See Restypie.ROUTER_TYPES about supported routers
   *
   * @property router
   * @writeOnce
   */
  get router() { return this._router; }

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
   *
   * @property host
   * @type {String}
   */
  get host() { return this._host; }

  /**
   *
   * @property routerType
   * @returns {String}
   */
  get routerType() { return this._routerType; }

  get routes() { return this._routes; }


  /**
   * @constructor
   */
  constructor(options) {
    options = options || {};
    this.reset();
    if (options.routerType) this._setRouterType(options.routerType);
    if (options.router) this._router = options.router;
    if (options.host) this._setHost(options.host);
    if (options.path) this.setPath(options.path);
    if (options.routes) {
      options.routes.forEach(route => Restypie.Utils.isSubclassOf(route, Restypie.Route, true));
      this._routes = options.routes.map((Route) => {
        return new Route({ api: this, routerType: this.routerType });
      });
    } else {
      this._routes = [];
    }
  }


  /**
   * Launches the API.
   *
   * **IMPORTANT** : this method can only be called once
   *
   * @method launch
   */
  launch(router, host) {
    this._throwIfLaunched();

    router = this._router = router || this._router;
    if (host) this._setHost(host);

    if (!router) throw new Error('An API requires a router (see Restypie.RouterTypes for supported frameworks)');
    if (!URLValidator.isWebUri(this._host)) throw new Error('An API requires a `host` to perform calls for population');

    let apiPath = this._path;
    let resources = this._resources;

    // List routes from all resources
    const routes = Object.keys(resources).reduce(function (acc, resourceName) {
      let resource = resources[resourceName];
      let resourcePath = resource.path;
      return acc.concat(resource.routes.map(function (route) {
        return {
          routerType: route.routerType,
          method: route.method,
          path: Restypie.Url.join('/', apiPath, resourcePath, route.path).replace(/\/$/, ''),
          handlers: route.handlers
        };
      }));
    }, []).concat(this._routes.map((selfRoute) => {
      return {
        routerType: selfRoute.routerType,
        method: selfRoute.method,
        path: Restypie.Url.join('/', apiPath, selfRoute.path).replace(/\/$/, ''),
        handlers: selfRoute.handlers
      };
    }));

    // Sort the routes and declare them to the app
    Restypie.RoutesSorter
      .sort(routes)
      .forEach(this._registerRoute.bind(this));

    // The API is now launched and couldn't be launched again
    this._isLaunched = true;

    return this;
  }

  /**
   * Performs operations for the api to be able to launch again. Especially useful for tests purpose.
   *
   * @method reset
   * @chainable
   */
  reset() {
    this._resources = {};
    this._isLaunched = false;
    this._path = '';
    this._router = null;
    this._host = null;
    return this;
  }

  /**
   * Set the api path.
   * 
   * @method setPath
   * @param {String} path
   * @chainable
   */
  setPath(path) {
    this._throwIfLaunched();
    this._path = path;
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
  
  getResourceByName(name) {
    return this._resources[name];
  }

  _setRouterType(routerType) {
    this._throwIfLaunched();

    Restypie.assertSupportedRouterType(routerType);
    this._routerType = routerType;
    return this;
  }

  _setHost(host) {
    if (typeof host === 'string') host = URL.parse(host);

    this._host = URL.format({
      host: host.host || null,
      protocol: host.protocol || 'http',
      hostname: host.hostname || '127.0.0.1',
      port: host.port || 80
    });
  }

  _registerRoute(def) {
    const routerType = def.routerType || this._routerType;
    Restypie.assertSupportedRouterType(routerType);

    switch (routerType) {
      case Restypie.RouterTypes.EXPRESS:
      case Restypie.RouterTypes.KOA_ROUTER:
        this._router[def.method.toLowerCase()].apply(this._router, [def.path].concat(def.handlers));
        break;
    }
  }

  _throwIfLaunched() {
    if (this._isLaunched) throw new Error(`API ${this} can only be launched once`);
  }
};
