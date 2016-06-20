'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let _ = require('lodash');

const PATH_WEIGHTS = { FIXED: 3, PARAM: 2, OPTIONAL: 1, BLANK: 0 };

/***********************************************************************************************************************
 * Exposes a single `sort` method that sorts a given routes list to avoid any conflicts.
 *
 * **Example**
 *
 * Let's say you declare the two following _Route1_ and _Route2_ on your express app :
 *
 * ```javascript
 * let routes = [
 *   { method: 'get', path: '/users' }, // Route1
 *   { method: 'get', path: '/users/:id' } // Route2
 * ];
 * ```
 *
 * _Route2_ will never be reached, because its pattern will first match _Route1_. Let's do some magic :
 *
 * ```
 * RoutesSorter.sort(routes);
 * ```
 *
 * The `routes` array will now look like :
 *
 * ```
 * [
 *   { method: 'get', path: '/users/:id' },
 *   { method: 'get', path: '/users' }
 * ]
 * ```
 *
 *
 * TODO explain how sorting works
 *
 * @namespace Restypie
 * @class RoutesSorter
 **********************************************************************************************************************/
module.exports = {

  /**
   * Sort an array of routes to avoid conflicts.
   *
   * **IMPORTANT** This method affects the original array.
   *
   * @method sort
   * @static
   * @param {Object[]} routes
   * @param {String} routes.method
   * @param {String} routes.path
   * @return {Object[]}
   */
  sort(routes) {
    let self = this;
    let sorted = [];

    let routesByMethod = _.groupBy(routes.map(function (route, i) {
      return { method: (route.method || '').toLowerCase(), path: route.path, originalIndex: i };
    }), 'method');

    let tmp = routes.splice(0, routes.length);

    Object.keys(routesByMethod).sort().forEach(function (methodName) {
      self._computeMethodRoutes(routesByMethod[methodName]);
      sorted = sorted.concat(routesByMethod[methodName]);
    });

    sorted.forEach(function (route, i) {
      routes[i] = tmp[route.originalIndex];
    });

    return routes;
  },

  /**
   * Compute routes for a method (called after routes are grouped by method).
   *
   * @method _computeMethodRoutes
   * @static
   * @param {Array} routes
   * @private
   */
  _computeMethodRoutes(routes) {
    let self = this;
    let maxPartsLength = 0;

    routes.forEach(function (route) {
      route.parts = _.compact(route.path.split('/')).map(self._getPathWeight, self);
      let routePartsLength = route.parts.length;
      if (routePartsLength > maxPartsLength) maxPartsLength = routePartsLength;
    });

    routes.forEach(function (route) {
      self._fillPartsArray(route.parts, maxPartsLength);
    });

    routes.sort(function (a, b) {
      let aPath = a.path;
      let bPath = b.path;
      return aPath < bPath ? -1 : aPath === bPath ? 0 : 1;
    });

    routes.sort(function (a, b) {
      for (let i = 0; i < maxPartsLength; i++) {
        let aVal = a.parts[i];
        let bVal = b.parts[i];
        if (aVal === bVal) continue;
        return aVal > bVal ? -1 : 1;
      }
      return 0;
    });
  },

  /**
   * Get `_PATH_WEIGHTS` corresponding value for `str`.
   *
   * @method _getPathWeight
   * @static
   * @param {String} str
   * @return {Number}
   * @private
   */
  _getPathWeight(str) {
    return str.match(/^:/) ? str.match(/\?$/) ? PATH_WEIGHTS.OPTIONAL : PATH_WEIGHTS.PARAM : PATH_WEIGHTS.FIXED;
  },

  /**
   * Ensures that `arr` is `length` long by filling it with `_PATH_WEIGHTS.BLANK`.
   *
   * @method _fillPartsArray
   * @static
   * @param {Array} arr
   * @param {Number} length
   * @return {Array}
   * @private
   */
  _fillPartsArray(arr, length) {
    while (arr.length < length) {
      arr.push(PATH_WEIGHTS.BLANK);
    }
    return arr;
  }

};