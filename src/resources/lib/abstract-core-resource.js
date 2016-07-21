'use strict';

let Restypie = require('../../');
let _ = require('lodash');

module.exports = class AbstractCoreResource {

  /**
   * Shortcut to get the resource's primary key field.
   *
   * @attribute primaryKeyField
   * @type Restypie.Fields.AbstractField
   */
  get primaryKeyField() { return this._primaryKeyField; }

  /**
   * All the fields, mapped by `key`.
   *
   * @attribute fieldsByKey
   * @type Object
   */
  get fieldsByKey() { return _.indexBy(this.fields, 'key'); }

  /**
   * All the fields, mapped by `path`.
   *
   * @attribute fieldsByKey
   * @type Object
   */
  get fieldsByPath() { return _.indexBy(this.fields, 'path'); }

  get routerType() { return null; }


  constructor() {
    Restypie.Utils.forceAbstract(this, AbstractCoreResource, true);

    // Build and validate fields
    this.createFields();
    this._ensurePrimaryKeyField();
  }
  
  /**
   * Checks that `Route` is a valid subclass and instantiate it with the right context.
   *
   * **Throws:**
   * - `TypeError`: If `route` is not an instance of `Restypie.Route`
   *
   * @method _createRoute
   * @param {Restypie.Route} Route
   * @return {Restypie.Route}
   */
  _createRoute(Route) {
    Restypie.Utils.isSubclassOf(Route, Restypie.Route, true);
    return new Route({ resource: this, routerType: this.routerType });
  }

  /**
   * Instantiates the routes.
   *
   * **Throws:**
   * - `TypeError`: If one of the parameters is not an instance of `Restypie.Route`
   *
   * @method _createRoutes
   * @private
   */
  _createRoutes() {
    const routes = this.routes.map(this._createRoute.bind(this));
    Object.defineProperty(this, 'routes', { get() { return routes; } });
  }


  /**
   * Computes and returns the full url for this resource on its host.
   *
   * @method getFullUrl
   * @return {String}
   */
  getFullUrl() {
    return null;
  }

  /**
   * Creates the fields based on `schema` and sets `fields`.
   *
   * @method createFields
   */
  createFields() {
    let schema = this.schema;
    let fields = [];

    if (_.isPlainObject(schema) && !_.isEmpty(schema)) {
      for (let key of Object.getOwnPropertyNames(schema)) {
        let def = schema[key];
        let Field = Restypie.Fields.match(def.type);
        fields.push(new Field(key, def));
      }
    }

    this.fields = fields;
  }


  /**
   * Ensures that the resource has one (and only one) primary key field.
   *
   * @method _ensurePrimaryKeyField
   * @private
   */
  _ensurePrimaryKeyField() {
    let primaryKeys = this.fields.filter(function (field) { return field.isPrimaryKey; });
    if (!primaryKeys.length) throw new Error('A resource requires a primary key field');
    if (primaryKeys.length > 1) throw new Error('Can only have a single primary key field, got ' + primaryKeys.length);
    this._primaryKeyField = primaryKeys[0];
  }
};