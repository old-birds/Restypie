'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
const _ = require('lodash');
const Negotiator = require('negotiator');
const Busboy = require('busboy');
const bodyParser = require('body-parser');
const typeIs = require('type-is');
const formDataToObject = require('form-data-to-object');
const Promise = require('bluebird');

let Restypie = require('../../');
let Utils = Restypie.Utils;

const RESERVED_KEYWORDS = Restypie.RESERVED_WORDS;

const PRIMARY_KEY_KEYWORD = '$primaryKey';

const DEFAULTS = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  SERIALIZERS: [Restypie.Serializers.JSONSerializer]
};

/***********************************************************************************************************************
 * @namespace Restypie.Resources
 * @class AbstractResource
 * @extends AbstractCoreResource
 * @constructor
 * @abstract
 **********************************************************************************************************************/
module.exports = class AbstractResource extends Restypie.Resources.AbstractCoreResource {

  /**
   * @property path
   * @type String
   * @default null
   */
  get path() { return null; }

  /**
   * Path to be used when building `next` and `prev`, defaults to the resource's path. Useful to allow
   *
   * @property displayPath
   * @type String
   * @default path
   */
  get displayPath() { return this.path; }

  get fullDisplayPath() { return Restypie.Url.join('/', this.api.path, this.displayPath); }

  /**
   * @property schema
   * @type Object
   * @default {}
   */
  get schema() { return {}; }

  /**
   * @property routes
   * @type Restypie.Route[]
   * @default []
   */
  get routes() { return []; }

  /**
   * @property serializers
   * @type Restypie.Serializers.AbstractSerializer[]
   * @default [Restypie.Serializers.JSONSerializer]
   */
  get serializers() { return DEFAULTS.SERIALIZERS; }

  /**
   * @property defaultLimit
   * @type Number
   * @default 20
   */
  get defaultLimit() { return DEFAULTS.DEFAULT_LIMIT; }

  /**
   * @property maxLimit
   * @type Number
   * @default 100
   */
  get maxLimit() { return DEFAULTS.MAX_LIMIT; }

  /**
   * @property minQueryScore
   * @type Number
   * @default 0
   */
  get minQueryScore() { return 0; }

  /**
   * @property maxDeepLevel
   * @type Number
   * @default 5
   */
  get maxDeepLevel() { return 5; }

  /**
   * Shortcut to get all `isReadable` fields.
   *
   * @attribute readableFields
   * @type Restypie.Fields.AbstractField[]
   */
  get readableFields() { return this.fields.filter(function (field) { return field.isReadable; }); }

  /**
   * Shortcut to get all `isFilterable` fields.
   *
   * @attribute filterableFields
   * @type Restypie.Fields.AbstractField[]
   */
  get filterableFields() { return this.fields.filter(function (field) { return field.isFilterable; }); }

  /**
   * Shortcut to get all `isWritable` fields.
   *
   * @attribute writableFields
   * @type Restypie.Fields.AbstractField[]
   */
  get writableFields() { return this.fields.filter(function (field) { return field.isWritable; }); }

  /**
   * Shortcut to get all `isPopulable` fields.
   *
   * @attribute populableFields
   * @type Restypie.Fields.AbstractField[]
   */
  get populableFields() { return this.fields.filter(function (field) { return field.isPopulable; }); }
  
  get requiredFields() { return this.fields.filter(function (field) { return field.isRequired; }); }

  /**
   * Shortcut to get all file fields (instances of Restypie.Fields.FileField or its subclasses).
   *
   * @attribute fileFields
   * @type Restypie.Fields.FileField[]
   */
  get fileFields() {
    return this.fields.filter(function (field) { return field instanceof Restypie.Fields.FileField; });
  }

  /**
   * List of supported mime types from 'serializers'.
   *
   * @attribute supportedFormatMimeTypes
   * @type String[]
   */
  get supportedFormatMimeTypes() { return this.serializers.map(function (serializer) { return serializer.mimeType; }); }

  /**
   * List of supported mime type aliases from 'serializers'.
   *
   * @attribute supportedFormatAliases
   * @type String[]
   */
  get supportedFormatAliases() {
    return this.serializers.reduce(function (acc, serializer) { return acc.concat(serializer.aliases); }, []);
  }

  /**
   * List of supported of both mime types and aliases from 'serializers'.
   *
   * @attribute supportedFormatMimeTypesAndAliases
   * @type String[]
   */
  get supportedFormatMimeTypesAndAliases() {
    return this.supportedFormatAliases.concat(this.supportedFormatMimeTypes);
  }

  /**
   * Defines whether or not the resource supports uniqueness constraints.
   *
   * @attribute supportsUniqueConstraints
   * @type Boolean
   */
  get supportsUniqueConstraints() { return false; }
  
  
  get supportsUpserts() { return false; }
  
  get upsertPaths() { return []; }
  
  get routerType() { return this.api.routerType; }

  /**
   * Supported options/flags for this resource.
   *
   * @attribute options
   * @type Object
   *
   * @example
   * ```javascript
   * class MyResource extends Restypie.Resources.FixturesResource {
   *   get options() { return Object.assign({ MY_OPTION: 'my_option }, super.options); }
   * }
   * ```
   */
  get options() { return Object.assign({}, Restypie.QueryOptions); }

  /**
   * Fields to be selected by default. By default select all readable fields.
   *
   * @attribute defaultSelect
   * @return {Array}
   */
  get defaultSelect() {
    return this.readableFields
      .filter(function (field) { return !field.isRelation; })
      .map(function (field) { return field.key; });
  }

  /**
   * Default sorting : none.
   *
   * @attribute defaultSort
   * @return {Array}
   */
  get defaultSort() { return []; }



  /**
   * @constructor
   */
  constructor(api) {
    super();
    Utils.forceAbstract(this, AbstractResource);
    
    if (!Array.isArray(this.routes)) throw new TypeError('Property `routes` should be an array');
    
    // Keep a reference to the api, do not allow to modify it
    Object.defineProperty(this, 'api', { get() { return api; } });

    // Create the routes
    this._createRoutes();

    // Validate properties
    if (!_.isString(this.path)) throw new TypeError('Property `path` should be a string');
    if (!Utils.isValidNumber(this.defaultLimit)) throw new TypeError('Property `defaultLimit` should be a number');
    if (!Utils.isValidNumber(this.maxLimit)) throw new TypeError('Property `maxLimit` should be a number');
    
    const schema = this.schema;

    if (this.defaultSelect) {
      this.defaultSelect.forEach(keyItem => {
        if (!schema.hasOwnProperty(keyItem)) {
          throw new Error('Schema doesnt have this property ' + keyItem);
        }
      });
    }
  }


  beforeValidate(bundle) {
    return bundle.next();
  }

  afterValidate(bundle) {
    return bundle.next();
  }

  beforeHydrate(bundle) {
    return bundle.next();
  }

  afterHydrate(bundle) {
    return bundle.next();
  }

  beforeDehydrate(bundle) {
    return bundle.next();
  }

  afterDehydrate(bundle) {
    return bundle.next();
  }

  beforeParseFilters() {}

  afterParseFilters() {}

  /**
   * Retrieves the `key` corresponding to `path` from `fields`, if any is found.
   *
   * @method fieldPathToKey
   * @param {String} path
   * @return {String|undefined}
   */
  fieldPathToKey(path) {
    let field = this.fields.find(function (item) { return item.path === path; });
    return field && field.key;
  }

  /**
   * Computes and returns the full url for this resource on its host.
   *
   * @method getFullUrl
   * @return {String}
   */
  getFullUrl() {
    let api = this.api;
    return Restypie.Url.join(api.host, api.path, this.path);
  }

  /**
   *
   * @method countObjects
   * @return {Promise}
   */
  countObjects() {
    return Promise.reject(new Restypie.RestErrors.NotImplemented());
  }

  /**
   *
   * @method createObject
   * @return {Promise}
   */
  createObject() {
    return Promise.reject(new Restypie.RestErrors.NotImplemented());
  }

  /**
   *
   * @method createObjects
   * @return {Promise}
   */
  createObjects() {
    return Promise.reject(new Restypie.RestErrors.NotImplemented());
  }

  /**
   * Responsible of fetching a **single** object from the storage. This method **must** resolve with an object.
   *
   * @method getObject
   * @return {Promise}
   */
  getObject() {
    return Promise.reject(new Restypie.RestErrors.NotImplemented());
  }

  /**
   * Responsible of fetching a **several** objects from the storage. This method **must** resolve with an array.
   *
   * @method getObjects
   * @return {Promise}
   */
  getObjects() {
    return Promise.reject(new Restypie.RestErrors.NotImplemented());
  }

  /**
   * Responsible of updating a **single** object in the storage.
   *
   * @method updateObject
   * @return {Promise}
   */
  updateObject() {
    return Promise.reject(new Restypie.RestErrors.NotImplemented());
  }

  /**
   * Responsible of deleting a **single** object from the storage.
   *
   * @method deleteObject
   * @return {Promise}
   */
  deleteObject() {
    return Promise.reject(new Restypie.RestErrors.NotImplemented());
  }

  /**
   * Responsible of replacing a **single** object in the storage.
   *
   * @method replaceObject
   * @return {Promise}
   */
  replaceObject() {
    return Promise.reject(new Restypie.RestErrors.NotImplemented());
  }

  /**
   * Builds a comprehensive object to describe the resource's capabilities and schema.
   *
   * @method getSchemaDescription
   * @return {Object}
   */
  getSchemaDescription() {
    let description = {
      fields: {}
    };

    let self = this;
    let api = this.api;

    description.routes = this.routes.map(function (route) {
      return {
        method: route.method,
        path: Restypie.Url.join('/', api.path, self.path, route.path)
      };
    });

    this.fields.forEach(function (field) {
      let fieldDesc = description.fields[field.key] = {
        type: field.displayType,
        isRequired: field.isRequired,
        isReadable: field.isReadable,
        isFilterable: field.isFilterable,
        isWritable: field.isWritable,
        isUpdatable: field.isUpdatable,
        isPopulable: !!field.isPopulable,
        options: _.transform(_.pick(field, field.optionsProperties || []), function (obj, value, key) {
          obj[key] = value.toString();
        })
      };

      if (field.isFilterable) {
        fieldDesc.supportedOperators = field.supportedOperators.map(function (operator) {
          return operator.stringName;
        });
      }

    });

    return description;
  }

  /**
   * Looks into `resource.serializers` to find a serializer that corresponds to `type`. If none is found, `null` is
   * returned.
   *
   * @param {String} type
   * @return {Restypie.Serializers.AbstractSerializer | null}
   */
  getSerializerByAliasOrMimeType(type) {
    for (let serializer of this.serializers) {
      if (serializer.mimeType === type || _.includes(serializer.aliases, type)) return serializer;
    }
    return null;
  }

  /**
   * Parses options.
   *
   * @method parseOptions
   * @param {Restypie.Bundle} bundle
   *
   */
  parseOptions(bundle) {
    const supported = _.values(this.options);
    const queryOptions = Restypie.listToArray(bundle.query.options || '');

    queryOptions.forEach(function (option) {
      if (!_.contains(supported, option)) {
        throw new Restypie.TemplateErrors.UnsupportedOption({ option, options: supported });
      }
    });

    bundle.setOptions(queryOptions);
  }

  /**
   * Decide which strategy to adopt to parse the body and fulfills `bundle.body`. Will reject with a 415 if the
   * content type cannot be negotiated.
   *
   * For now supports :
   * - "multipart/form-data" : for file uploads and fields
   * - "application/json" : `req.body` is assumed to be filled, not additional parsing is made
   *
   * @method parseBody
   * @param {Restypie.Bundle} bundle
   * @return {Promise}
   */
  parseBody(bundle) {
    let supported = ['application/json', 'multipart/form-data'];
    switch (typeIs(bundle.req, supported)) {
      case 'application/json':
        return this._parseJSON(bundle);
      case 'multipart/form-data':
        return this._parseMultipart(bundle);
    }

    let headers = bundle.req.headers['content-type'];
    return Promise.reject(new Restypie.TemplateErrors.UnsupportedFormat({ expected: supported, value: headers }));
  }

  /**
   * Sets `bundle.limit` either from the query string or using `resource.defaultLimit`.
   *
   * **Throws:**
   *
   * - `Restypie.TemplateErrors.BadType`: If `limit` has been provided in the query string but could not be casted
   * to a valid integer
   * - `Restypie.TemplateErrors.OutOfRange`: If the requested limit exceeds `resource.maxLimit` or is lower than 1
   *
   * @method parseLimit
   * @param {Restypie.Bundle} bundle
   */
  parseLimit(bundle) {
    let raw = bundle.query;

    if ('limit' in raw) {
      let rawLimit = raw.limit;
      let max = this.maxLimit;
      let parsedLimit = parseInt(rawLimit, 10);
      if (!Utils.isValidNumber(parsedLimit)) {
        throw new Restypie.TemplateErrors.BadType({ key: 'limit', value: rawLimit, expected: 'integer' });
      }
      
      const isOutOfRange = parsedLimit < 0 ||
        parsedLimit > max ||
        (parsedLimit === 0 && !this.isGetAllAllowed && !bundle.isSudo);
      
      if (isOutOfRange) {
        throw new Restypie.TemplateErrors.OutOfRange({ key: 'limit', value: parsedLimit, min: 1, max });
      }
      bundle.setLimit(parsedLimit);
    } else {
      bundle.setLimit(this.defaultLimit);
    }
  }

  /**
   * Sets `bundle.offset` from the query string. Defaults to 0.
   *
   * **Throws:**
   *
   * - `Restypie.TemplateErrors.BadType`: If `offset` has been provided in the query string but could not be casted
   * to a valid integer
   * - `Restypie.TemplateErrors.OutOfRange`: If the requested offset is lower than 0
   *
   * @method parseOffset
   * @param {Restypie.Bundle} bundle
   */
  parseOffset(bundle) {
    let raw = bundle.query;

    if ('offset' in raw) {
      let rawOffset = raw.offset;
      let parsedOffset = parseInt(rawOffset, 10);
      if (!Utils.isValidNumber(parsedOffset)) {
        throw new Restypie.TemplateErrors.BadType({ key: 'offset', value: rawOffset, expected: 'integer' });
      }
      if (parsedOffset < 0) {
        throw new Restypie.TemplateErrors.OutOfRange({ key: 'offset', value: parsedOffset, min: 0 });
      }
      bundle.setOffset(parsedOffset);
    } else {
      bundle.setOffset(0);
    }
  }

  /**
   * Parses fields to be sorted. Defaults to `defaultSort`.
   *
   * @method parseSort
   * @param {Restypie.Bundle} bundle
   */
  parseSort(bundle) {
    let fieldsByKey = this.fieldsByKey;
    let sort = Restypie.listToArray(bundle.query.sort);
    sort.forEach(function (key) {
      key = key.replace(/^-/, '');
      let field = fieldsByKey[key];
      if (!field || !field.isFilterable) throw new Restypie.TemplateErrors.UnknownPath({ key });
    });
    if (!sort.length) sort = this.defaultSort;

    bundle.setSort(sort.map(function (key) {
      let isNegative = false;
      if (/^-/.test(key)) {
        isNegative = true;
        key = key.replace(/^-/, '');
      }
      return (isNegative ? '-' : '') + fieldsByKey[key].path;
    }));
  }

  /**
   * Sets `bundle.format` either from the query string of the `Accept` header, the query string having the precedence.
   *
   * **Throws:**
   * - `Restypie.TemplateErrors.UnsupportedFormat`: If no corresponding serializer is found.
   *
   * @param {Restypie.Bundle} bundle
   */
  parseFormat(bundle) {
    let raw = bundle.query;
    let desired;
    let format;

    if ('format' in raw) {
      desired = raw.format;
      let serializer = this.getSerializerByAliasOrMimeType(raw.format);
      if (serializer) format = serializer.mimeType;
    } else {
      desired = bundle.req.headers.accept;
      format = new Negotiator(bundle.req).mediaType(this.supportedFormatMimeTypes);
    }

    if (desired && !format) {
      let meta = { expected: this.supportedFormatMimeTypesAndAliases, value: desired };
      throw new Restypie.TemplateErrors.UnsupportedFormat(meta);
    }

    bundle.setFormat(format);
  }

  /**
   * Parses the filters (and nested filters).
   *
   * @method parseFilters
   * @param {Restypie.Bundle} bundle
   */
  parseFilters(bundle) {
    this.beforeParseFilters(bundle);
    
    let fieldsMap = this.fieldsByKey;
    let query = _.omit(bundle.query, RESERVED_KEYWORDS);
    let filters = {};
    let nestedFilters = {};
    let separator = this.constructor.OPERATOR_SEPARATOR;
    let deepSeparator = this.constructor.DEEP_PROPERTY_SEPARATOR;
    let equalityOperator = this.constructor.EQUALITY_OPERATOR;


    for (let prop in query) {
      
      const parts = prop.split(deepSeparator);
      const baseProp = parts.shift();

      if (parts.length) { // Nested filter
        const field = fieldsMap[baseProp];
        if (field) {
          // Relations need to explicitly declare that they can be filtered
          if (!field.isFilterable || !field.to) {
            throw new Restypie.TemplateErrors.NotFilterable({ key: baseProp });
          }

          // Note: use public `key` as this will be forwarded as is to external resources
          nestedFilters[field.key] = nestedFilters[field.key] || {};
          nestedFilters[field.key][parts.join(deepSeparator)] = query[prop];
        } else {
          throw new Restypie.TemplateErrors.UnknownPath({ key: baseProp });
        }
      } else {
        let couple = baseProp.split(separator);
        if (couple.length > 2) {
          throw new Restypie.TemplateErrors.UnknownPath({ key: couple.slice(0, couple.length - 1).join(separator) });
        }
        if (couple.length === 1) couple.push(equalityOperator);

        let key = couple[0];
        let operator = couple[1];
        let value = query[prop];

        let field = fieldsMap[key];
        if (field) {
          if (!field.isFilterable) throw new Restypie.TemplateErrors.NotFilterable({ key });

          let operatorClass = field.getOperatorByName(operator);
          if (!operatorClass) throw new Restypie.TemplateErrors.UnsupportedOperator({ key, operator });

          filters[field.path] = filters[field.path] || {};

          value = operatorClass.parse(value);
          filters[field.path][operator] = Array.isArray(value) ?
            value.map(field.hydrate.bind(field)) :
            field.hydrate(value);
        } else {
          throw new Restypie.TemplateErrors.UnknownPath({ key });
        }  
      }
      
    }

    for (let key in filters) {
      let filter = filters[key];
      if (filter.hasOwnProperty(equalityOperator) && Object.keys(filter).length > 1) {
        throw new Restypie.TemplateErrors.NotMixableOperators({ key, operators: Object.keys(filter).slice(0, 2) });
      }
    }

    bundle.setFilters(filters);
    bundle.setNestedFilters(nestedFilters);

    this.afterParseFilters(bundle);
  }

  /**
   * Parses fields to be selected. Returns `defaultSelect` if none.
   *
   * @method parseSelect
   * @param {Restypie.Bundle} bundle
   */
  parseSelect(bundle) {
    const self = this;
    let fieldsByKey = this.fieldsByKey;
    let select = Restypie.listToArray(bundle.query.select);
    select.forEach(function (key) {
      let field;
      if (key === PRIMARY_KEY_KEYWORD) {
        key = self.primaryKeyKey;
        select.splice(select.indexOf(PRIMARY_KEY_KEYWORD), 1, key);
      }
      field = fieldsByKey[key];
      if (!field || !field.isReadable) throw new Restypie.TemplateErrors.UnknownPath({ key });
    });
    if (!select.length) select = this.defaultSelect;

    bundle.setSelect(select.map(function (selected) {
      return fieldsByKey[selected].path;
    }));
  }

  /**
   * Parses fields to populate.
   *
   * @method parsePopulate
   * @param {Restypie.Bundle} bundle
   */
  parsePopulate(bundle) {
    let fieldsByKey = this.fieldsByKey;
    let toPopulate = Restypie.listToArray(bundle.query.populate).reduce(function (acc, key) {
      let parts = key.split('.'); // FIXME shouldn't use "." directly
      let rootKey = parts.shift();
      let field = fieldsByKey[rootKey];
      if (!field) throw new Restypie.TemplateErrors.UnknownPath({ key: rootKey });
      if (!field.isPopulable) throw new Restypie.TemplateErrors.NotPopulable({ key: rootKey });
      let obj = acc.find((item) => item.key === rootKey);
      if (!obj) {
        obj = { key: rootKey, populate: [] };
        acc.push(obj);
      }
      if (parts.length) obj.populate.push(parts.join('.')); // FIXME shouldn't use "." directly
      return acc;
    }, []);
    bundle.setPopulate(toPopulate);
  }


  /**
   * Produces a score for this query, according to the fields and operators filteringWeight. Makes distant queries if
   * necessary to get the nested filters scores.
   *
   * @param bundle
   * @async
   * @returns {Promise}
   */
  getQueryScore(bundle) {
    return Restypie.QueryScore.compute(this.fields, bundle);
  }

  /**
   * Validates that both total score and maximum level has respected
   *
   *
   * @param score
   * @returns {Promise.<boolean>}
   */
  validateQueryScore(score) {
    let isValid;

    if (Restypie.Utils.isValidNumber(this.minQueryScore)) isValid = score.total >= this.minQueryScore;
    else isValid = true;


    if (Restypie.Utils.isValidNumber(this.maxDeepLevel)) isValid &= score.maxLevel <= this.maxDeepLevel;

    return Promise.resolve(!!isValid);
  }

  /**
   * Augments existing root filters to include nested ones.
   *
   * @method applyNestedFilters
   * @async
   * @param {Restypie.Bundle} bundle
   * @returns {Promise}
   */
  applyNestedFilters(bundle) {
    if (!bundle.hasNestedFilters) return bundle.next();

    const headers = bundle.safeReqHeaders;
    const nestedFilters = bundle.nestedFilters;
    const primaryKeyPath = this.primaryKeyField.path;

    return Promise.reduce(Object.keys(nestedFilters), (acc, key) => {
      const field = this.fieldsByKey[key];
      const toClient = field.to.createClient({ defaultHeaders: headers }, true);

      if (field.isManyRelation) {
        if (field.through) {
          const throughClient = field.through.createClient({ defaultHeaders: headers }, true);

          return toClient.find(nestedFilters[key], {
            select: PRIMARY_KEY_KEYWORD,
            limit: 0,
            options: Restypie.QueryOptions.NO_COUNT
          }).then((data) => {
            const ids = data.map(item => item[Object.keys(item)[0]]);

            return throughClient.find({ [field.otherThroughKey]: { in: ids } }, {
              limit: 0,
              select: field.throughKey,
              options: Restypie.QueryOptions.NO_COUNT
            }).then((data) => {
              acc[primaryKeyPath] = Restypie.mergeFiltersForKey(acc[primaryKeyPath], {
                in: data.map((item) => { return item[field.throughKey]; })
              });
              return Promise.resolve(acc);
            });
          });
        } else {
          return toClient.find(nestedFilters[key], {
            select: field.toKey,
            limit: 0,
            options: Restypie.QueryOptions.NO_COUNT
          }).then((data) => {
            acc[primaryKeyPath] = Restypie.mergeFiltersForKey(acc[primaryKeyPath], {
              in: data.map((item) => { return item[field.toKey]; })
            });
            return Promise.resolve(acc);
          });
        }
      } else {
        return toClient.find(nestedFilters[key], {
          select: PRIMARY_KEY_KEYWORD,
          limit: 0,
          options: Restypie.QueryOptions.NO_COUNT
        }).then((data) => {
          acc[field.fromKey] = Restypie.mergeFiltersForKey(acc[field.fromKey], {
            in: data.map((item) => { return item[Object.keys(item)[0]]; })
          });
          return Promise.resolve(acc);
        });
      }

    }, {}).then((filters) => {
      bundle.mergeToFilters(filters);
      return bundle.next();
    });
  }

  /**
   * Transforms each keys and values into their internal version.
   *
   * @method hydrate
   * @async
   * @param {Restypie.Bundle} bundle
   * @return {Promise}
   *
   * @example
   * Given the following `users` resource definition :
   * ```javascript
   * let usersResource = new Restypie.Resources.FixturesResource({
   *   path: '/users',
   *   writableFields: ['firstName', 'lastName', 'yearOfBirth', 'profilePicture']
   *   schema: {
   *     firstName: { path: 'fName', type: String },
   *     lastName: { path: 'lName', type: String },
   *     yearOfBirth: { path: 'year', type: 'int' },
   *     profilePicture: { path: 'pic', type: 'file' }
   *   }
   * });
   * ```
   * And the following multipart request against the API :
   * ```javascript
   * // POST /my-api/users
   * // Content-Type: multipart/form-data
   * // Body :
   * {
   *   firstName: 'John',
   *   lastName: 'Doe',
   *   yearOfBirth: '1986',
   *   profilePicture: ** a file named foo.png **
   * }
   * ```
   * **Before** being _hydrated_ (aka, went through the `hydrate` method), `bundle.body` will look like :
   * ```javascript
   * bundle.body = {
   *   firstName: 'John',
   *   lastName: 'Doe',
   *   yearOfBirth: '1986',
   *   profilePicture: 'path/to/tmp/dir/restypie_1449991977517_foo.png' // The file has been automatically written
   * };
   * ```
   * **After** having been _hydrated_, `bundle.body` will look like :
   * ```javascript
   * bundle.body = { // Fields now have their internal name ("path")
   *   fName: 'John',
   *   lName: 'Doe',
   *   year: 1986, // Casted into an integer
   *   pic: 'path/to/tmp/dir/restypie_1449991977517_foo.png'
   * };
   * ```
   */
  hydrate(bundle) {
    let data = bundle.body;

    if (!_.isObject(data)) return bundle.next();

    let fieldsMap = this.fieldsByKey;
    let keys = Object.keys(fieldsMap);
    let isArray = Array.isArray(data);
    if (!isArray) data = [data];

    let final = [];

    return this.beforeHydrate(bundle)
      .then(function () {
        for (let object of data) {

          // Reject attempts to write fields that are not known
          let unknownKeys = Object.keys(_.omit(object, keys));
          if (unknownKeys.length) return bundle.next(new Restypie.TemplateErrors.UnknownPath({ key: unknownKeys[0] }));

          let ret = {};

          // Now the object is assumed to contain only known keys
          for (let key of keys) {
            let field = fieldsMap[key];
            if (object.hasOwnProperty(key) || (!bundle.isUpdate && field.hasDefault)) {
              try {
                ret[field.path] = field.hydrate(object[key]);
              } catch (err) {
                return bundle.next(err);
              }
            }
          }

          final.push(ret);
        }

        return bundle.setBody(isArray ? final : final[0]).next();
      }).then(this.afterHydrate.bind(this, bundle))
        .then(function () { return bundle.next(); });
  }

  /**
   *
   *
   * @method validate
   * @async
   * @param {Restypie.Bundle} bundle
   */
  validate(bundle) {
    let data = bundle.body;

    if (!_.isObject(data)) return bundle.next();

    let fieldsMap = this.fieldsByPath;
    let isUpdate = bundle.isUpdate;
    let isArray = Array.isArray(data);
    if (!isArray) data = [data];

    return this.beforeValidate(bundle)
      .then(function () {
        for (let object of data) {
          for (let key of Object.getOwnPropertyNames(fieldsMap)) {
            let field = fieldsMap[key];
            let value = object[key];
            try {
              if (!isUpdate) field.validatePresence(value);
            } catch (err) {
              return bundle.next(err);
            }
            if (field.isPresent(value)) {
              if (!field.isWritable) {
                return bundle.next(new Restypie.TemplateErrors.NotWritable({ key: field.key, value }));
              }
              if (isUpdate && !field.isUpdatable) {
                return bundle.next(new Restypie.TemplateErrors.NotUpdatable({ key: field.key, value }));
              }
              field.validate(value);
            }
          }
        }

        return bundle.next();
      }).then(this.afterValidate.bind(this, bundle))
        .then(function () { return bundle.next(); });
  }

  /**
   * Formats `bundle.data` before it is delivered. For security reasons, only fields that are `isSelectable` are
   * returned.
   *
   * @methods dehydrate
   * @async
   * @param {Restypie.Bundle} bundle
   * @return {Promise}
   */
  dehydrate(bundle) {
    let data = bundle.data;

    if (!_.isObject(data)) return bundle.next();

    let isArray = Array.isArray(data);
    let fields = this.readableFields;
    if (!isArray) data = [data];

    return this.beforeDehydrate(bundle)
      .then(function () {
        data = data.map(function (object) {
          let ret = {};
          fields.forEach(function (field) {
            if (object.hasOwnProperty(field.path)) {
              let value = object[field.path];
              ret[field.key] = field.isPresent(value) ? field.dehydrate(value) : value;
            }
          });
          return ret;
        });

        return bundle.setData(isArray ? data : data[0]).next();
      }).then(this.afterDehydrate.bind(this, bundle))
        .then(function () { return bundle.next(); });
  }

  /**
   * Populates properties of the objects in `bundle.data` by requesting the associated resources.
   *
   * @method populate
   * @param {Restypie.Bundle} bundle
   * @return {Promise}
   *
   * FIXME this function is way too complex !
   */
  populate(bundle) {
    if (!bundle.populate) {
      try {
        this.parsePopulate(bundle);
      } catch (ex) {
        return Promise.reject(ex);
      }
    }

    if (!bundle.populate.length) return bundle.next(); // Nothing to do

    let fieldsByKey = this.fieldsByKey;

    return Promise.all(bundle.populate.map((keyDef) => {
      let key = keyDef.key;

      let field = fieldsByKey[key];
      if (!field || !field.isReadable) return bundle.next(new Restypie.TemplateErrors.UnknownPath({ key }));
      if (!field.isPopulable) return bundle.next(new Restypie.TemplateErrors.NotPopulable({ key }));

      let resource = field.to;
      Restypie.Utils.isInstanceOf(resource, Restypie.Resources.AbstractCoreResource, true);


      let data = Array.isArray(bundle.data) ? bundle.data : [bundle.data];

      return Promise.all(data.map((object) => {
        if (Restypie.Utils.isNone(object[key]) && !field.isRelation) return Promise.resolve();

        let toKeyField = resource.fieldsByKey[field.toKey];
        Restypie.Utils.isInstanceOf(toKeyField, Restypie.Fields.AbstractField, true);

        const headers = bundle.safeReqHeaders;

        const toClient = resource.createClient({ defaultHeaders: headers }, true);

        if (field.isManyRelation) {
          const through = field.through;

          if (through) {
            Restypie.Utils.isInstanceOf(through, Restypie.Resources.AbstractCoreResource, true);

            const throughClient = through.createClient({ defaultHeaders: headers }, true);

            let throughKeyField = through.fieldsByKey[field.throughKey];
            let otherThroughKeyField = field.through.fieldsByKey[field.otherThroughKey];
            Restypie.Utils.isInstanceOf(throughKeyField, Restypie.Fields.AbstractField, true);
            Restypie.Utils.isInstanceOf(otherThroughKeyField, Restypie.Fields.AbstractField, true);

            return throughClient.find({ [throughKeyField.key]: object[this.primaryKeyKey] }, {
              limit: 0,
              select: otherThroughKeyField.key,
              options: Restypie.QueryOptions.NO_COUNT
            }).then((data) => {
              const ids = _.uniq(_.map(data, otherThroughKeyField.key));

              if (ids.length) {
                return toClient.find({ [toKeyField.key]: { in: ids } }, {
                  limit: 0,
                  options: Restypie.QueryOptions.NO_COUNT,
                  populate: keyDef.populate
                }).then((data) => {
                  object[key] = data;
                  return bundle.next();
                });
              } else {
                object[key] = [];
                return bundle.next();
              }
            });
          } else {
            return toClient.find({ [toKeyField.key]: { eq: object[this.primaryKeyKey] } }, {
              limit: 0,
              options: Restypie.QueryOptions.NO_COUNT,
              populate: keyDef.populate
            }).then((data) => {
              object[key] = data;
              return bundle.next();
            });
          }
        } else {
          return toClient.findById(object[field.fromKey], {
            populate: keyDef.populate
          }).then((data) => {
            if (Array.isArray(data)) {
              return bundle.next(new Error('Unfiltered ToOne relation, consider using ToManyField : ' + field.key));
            }
            object[key] = data;
            return bundle.next();
          });
        }

      }));

    })).then(function () { return bundle.next(); });
  }
  
  
  exit(bundle) {
    return this.serialize(bundle).then(this.respond.bind(this, bundle));
  }

  /**
   * Serializes `bundle.payload` according to `bundle.format`, assuming that the format is valid and has been parsed
   * by `resource.parseFormat`.
   *
   * @method serialize
   * @param {Restypie.Bundle} bundle
   * @return {Promise}
   */
  serialize(bundle) {
    if (!bundle.format) {
      try {
        this.parseFormat(bundle);
      } catch (err) {
        return bundle.next(err);
      }
    }

    return this.getSerializerByAliasOrMimeType(bundle.format)
      .serialize(bundle.payload)
      .then(function (content) {
        return bundle.assignToHeaders({ 'content-type': bundle.format }).setPayload(content).next();
      })
      .catch (function (err) {
        return bundle.setError(err).next();
      });
  }

  /**
   * Sends the final response.
   *
   * - Extracts the status code from `bundle.statusCode`
   * - Extracts the headers code from `bundle.headers`
   * - Extracts the response body code from `bundle.payload`
   *
   * @method respond
   * @param {Restypie.Bundle} bundle
   */
  respond(bundle) {
    const res = bundle.res;
    const statusCode = bundle.statusCode;
    let payload = bundle.payload;

    // Headers
    for (let header of Object.getOwnPropertyNames(bundle.headers)) {
      res.setHeader(header, bundle.headers[header]);
    }

    // Default content-type to JSON
    if (!res.getHeader('content-type')) res.setHeader('content-type', 'application/json');

    // Status code
    if (statusCode) res.statusCode = statusCode;

    // Log request errors
    switch (true) {
      case !statusCode:
        Restypie.Logger.error('No statusCode for request on ' + bundle.req.url);
        break;
      case statusCode === Restypie.Codes.InternalServerError:
        Restypie.Logger.error(bundle.err.stack, bundle.err);
        break;
      case statusCode >= Restypie.Codes.BadRequest:
        Restypie.Logger.warn(bundle.err.stack, bundle.err);
        break;
    }

    if (typeof payload === 'object') payload = JSON.stringify(payload);

    res.end(payload || '');
  }


  /**
   * Parses files and fields from a multipart request. The files field names must match an existing `FileField` in the
   * schema. If no match is found, the file is not written and the method rejects. If a file size exceeds the `maxSize`
   * defined in the field, the request is rejected and the started upload rolled back in the storage.
   *
   * @method _parseMultipart
   * @param {Restypie.Bundle} bundle
   * @return {Promise}
   * @private
   */
  _parseMultipart(bundle) {
    // TODO move this part into a dedicated parser file
    let fields = this.fields;
    let fileFields = this.fileFields;

    return new Promise(function (resolve, reject) {
      let files = {};
      let body = {};
      let parser = new Busboy({ headers: bundle.req.headers });

      // Stop the request and reject if any error
      function onError(err) {
        bundle.req.pause();
        // Block Busboy from retrieving more data
        parser._parser.parser.removeAllListeners('part');
        return reject(err);
      }

      parser.on('field', function (name, value) { body[name] = value; });

      /* jshint -W072 */
      parser.on('file', function (name, file, fileName, encoding, mimeType) {
        /* jshint +W072 */

        // Retrieve the corresponding field
        let fileField = fileFields.find(function (field) { return field.key === name; });

        // Base definition for the file, missing `path` for now
        let fileDesc = { name: fileName, mimeType, encoding, size: 0 };

        // Per file error handler
        function onWriteError(err) {
          // Do not receive more data
          file.removeAllListeners('data');
          // Remove the partially uploaded file if written - silently
          if (fileField) fileField.unlink(fileDesc).catch (function () { /* TODO handle error */ });
          // Reject
          return onError(err);
        }

        // Do not write the file if it's not a file field
        if (!fileField) {
          let field = fields.find(function (field) { return field.key === name; });
          if (field) {
            let meta = { key: field.key, type: 'file', expected: field.displayType };
            return onWriteError(new Restypie.TemplateErrors.BadType(meta));
          } else {
            return onWriteError(new Restypie.TemplateErrors.UnknownPath({ key: name }));
          }
        }


        // Shortcut for size validation
        function validateSize() {
          try {
            fileField.validateSize(fileDesc);
          } catch (err) {
            return onWriteError(err);
          }
        }

        // Create the write stream
        let writeStream = fileField.writeStream(fileDesc);

        // Catch errors on the file
        file.on('error', onWriteError);

        // Measure and validate file size
        file.on('data', function (data) {
          fileDesc.size += data.length;
          validateSize();
        });

        // Catch errors on the write stream
        writeStream.on('error', onWriteError);

        // Register the file once it's fully uploaded. First validate that it has a `path`.
        file.on('end', function () {
          if (!_.isString(fileDesc.path)) return onError(new Error('`file.path` must be fulfilled during streaming'));
          files[name] = fileDesc.path;
        });

        // Finally open the stream
        return file.pipe(writeStream);
      });

      parser.on('error', onError);

      parser.on('finish', function () {
        body = formDataToObject.toObj(body);
        Object.assign(body, files);
        bundle.setBody(body);
        return resolve(bundle);
      });

      return bundle.req.pipe(parser);
    });
  }

  /**
   * Parses JSON
   *
   * @method _parseMultipart
   * @param {Restypie.Bundle} bundle
   * @return {Promise}
   * @private
   */
  _parseJSON(bundle) {
    // Body is already parsed
    if (bundle.req.body) {
      return bundle.setBody(bundle.req.body).next();
    }

    return new Promise((resolve, reject) => {
      bodyParser.json()(bundle.req, bundle.res, function (err) {
        if (err) return reject(err);
        bundle.setBody(bundle.req.body);
        return resolve(bundle);
      });
    });
  }
  
  reset() {
    if (process.env.NODE_ENV !== Restypie.TEST_ENV) {
      throw new Error('reset() is only intended to be used for Restypie internal testing');
    }
    return this.__reset();
  }

  static get LIST_SEPARATOR() { return /\s*,\s*/; }

  static get OPERATOR_SEPARATOR() { return '__'; }

  static get EQUALITY_OPERATOR() { return 'eq'; }

  static get DEEP_PROPERTY_SEPARATOR() { return '.'; }

};
