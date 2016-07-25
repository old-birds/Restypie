'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let Restypie = require('../../');
let _ = require('lodash');

/***********************************************************************************************************************
 * @namespace Restypie.Resources
 * @class SequelizeResource
 * @constructor
 **********************************************************************************************************************/
module.exports = class SequelizeResource extends Restypie.Resources.AbstractResource {

  get model() { return null; }

  get supportsUniqueConstraints() { return true; }
  
  get supportsUpserts() { return true; }

  constructor(api) {
    super(api);
    if (!this.model) throw new Error('SequelizeResource requires a `model`');
  }

  countObjects(bundle) {
    return this.model.count({
      where: SequelizeResource.formatFilters(bundle.filters)
    }).catch(this.mapErrors.bind(this));
  }

  createObject(bundle) {
    return this.model.create(bundle.body)
      .then(function (object) {
        return Promise.resolve(object.get({ plain: true }));
      }).catch(this.mapErrors.bind(this));
  }

  createObjects(bundle) {
    return Promise.all(bundle.body.map((props) => {
      return this.createObject({ body: props });
    }));
  }

  getObjects(bundle) {
    let options = {
      where: SequelizeResource.formatFilters(bundle.filters),
      attributes: bundle.select || ['*'],
      order: bundle.sort ? SequelizeResource.toOrder(bundle.sort) : null
    };
    if (bundle.limit) options.limit = bundle.limit;
    if (bundle.offset) options.offset = bundle.offset;
    return this.model.findAll(options).then(function (objects) {
      return Promise.resolve(objects.map(function (object) {
        return object.get({ plain: true });
      }));
    }).catch(this.mapErrors.bind(this));
  }

  getObject(bundle) {
    let options = { where: SequelizeResource.formatFilters(bundle.filters) };
    if (bundle.select) options.attributes = bundle.select;
    return this.model.findOne(options).then(function (object) {
      return Promise.resolve(object && object.get({ plain: true }));
    }).catch(this.mapErrors.bind(this));
  }

  updateObject(bundle) {
    return this.model.update(bundle.body, {
      where: SequelizeResource.formatFilters(bundle.filters),
      individualHooks: true
    }).then(function (result) {
      return Promise.resolve(result[0]);
    }).catch(this.mapErrors.bind(this));
  }

  updateObjects(bundle) {
    return this.model.update(bundle.body, {
      where: SequelizeResource.formatFilters(bundle.filters),
      individualHooks: true
    }).then(function (result) {
      return Promise.resolve(result[0]);
    }).catch(this.mapErrors.bind(this));
  }

  deleteObject(bundle) {
    return this.model.destroy({
      where: SequelizeResource.formatFilters(bundle.filters)
    }).then(function (result) {
      return Promise.resolve(result);
    }).catch(this.mapErrors.bind(this));
  }

  upsertObject(bundle) {
    let self = this;
    let filters = bundle.filters;
    let body = Object.assign({}, bundle.body);
    
    for (let key in filters) {
      if (filters[key].eq) body[key] = filters[key].eq;
    }
    
    return this.model.findOne({
      where: SequelizeResource.formatFilters(bundle.filters),
      attributes: [this.primaryKeyField.path]
    }).then((exists) => {
      if (exists) {
        return self.updateObject(bundle).then(() => {
          return self.getObject({
            filters: { [this.primaryKeyField.path]: exists[this.primaryKeyField.path] }
          }).then((object) => {
            return Promise.resolve({ isCreated: false, object });
          });
        });
      }
      return self.createObject(bundle).then((object) => {
        return Promise.resolve({ isCreated: true, object });
      });
    });
  }

  mapErrors(err) {
    let self = this;
    switch (err.name) {
      case 'SequelizeValidationError':
        let firstErr = err.errors[0];
        if (firstErr.type === 'notNull Violation') {
          err = new Restypie.TemplateErrors.Missing({ key: this.fieldPathToKey(firstErr.path) || firstErr.path });
          break;
        }
        if (firstErr.value === 'Validation min failed') {
          err = new Restypie.TemplateErrors.OutOfRange({
            key: this.fieldPathToKey(firstErr.path) || firstErr.path,
            min: _.get(this.model.attributes[firstErr.path], 'validate.min')
          });
          break;
        }
        if (firstErr.value === 'Validation max failed') {
          err = new Restypie.TemplateErrors.OutOfRange({
            key: this.fieldPathToKey(firstErr.path) || firstErr.path,
            min: _.get(this.model.attributes[firstErr.path], 'validate.max')
          });
          break;
        }
        err = new Restypie.RestErrors.BadRequest(firstErr.message);
        break;
      case 'SequelizeUniqueConstraintError':
        let fieldsByPath = this.fieldsByPath;
        let keys = err.errors.reduce(function (acc, subErr) {
          let value = subErr.value;
          let field = fieldsByPath[subErr.path];
          try { value = field.hydrate(value); } catch (ex) {}
          acc[self.fieldPathToKey(subErr.path) || subErr.path] = value;
          return acc;
        }, {});
        err = new Restypie.TemplateErrors.UniquenessConstraintViolation({ keys });
        break;

    }
    return Promise.reject(err);
  }


  reset() {
    if (process.env.NODE_ENV !== Restypie.TEST_ENV) {
      throw new Error('reset() is only intended to be used for Restypie internal testing');
    }
    return this.model.destroy({ where: { [this.primaryKeyPath]: { $ne: null } } });
  }


  static formatFilters(filters) {
    filters = _.clone(filters || {});
    let equalityOperator = this.EQUALITY_OPERATOR;

    for (let key in filters) {
      let filter = filters[key];

      if (filter.hasOwnProperty(equalityOperator)) filters[key] = filter[equalityOperator];

      if (filter.hasOwnProperty('nin')) {
        filter.notIn = filter.nin;
        delete filter.nin;
      }
    }


    return filters;
  }


  static toOrder(sort) {
    return sort.map(function (key) {
      let isDesc = /^-/.test(key);
      if (isDesc) key = key.replace(/^-/, '');
      return [key, isDesc ? 'DESC' : 'ASC'];
    });
  }

};
