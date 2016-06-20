'use strict';

module.exports = class Model {
  
  constructor(properties) {
    this._properties = properties;
    for (let key in properties) {
      Object.defineProperty(this, key, {
        get() { return this._properties[key]; },
        set(value) { this._properties[key] = value; },
        enumerable: true
      });
    }
  }
  
  toJSON() {
    return this._properties;
  }
  
  static get client() { throw new Error('A model class should have a `client` (Restypie.Client) static instance'); }
  
  static find(filters, options) {
    return this.client.find(Object.assign({}, options, { filters })).then((objects) => {
      return Promise.resolve(objects.map((object) => new this(object)));
    });
  }
  
  static findOne(filters, options) {
    return this.client.findOne(Object.assign({}, options, { filters })).then((object) => {
      return Promise.resolve(object ? new this(object) : null);
    });
  }
  
  static findById(id, options) {
    return this.client.findById(id, options).then((object) => {
      return Promise.resolve(new this(object));
    });
  }
  
  static create(objects, options) {
    return this.client.create(objects, options).then((objects) => {
      if (Array.isArray(objects)) objects = objects.map((object) => new this(object));
      else objects = new this(objects);
      return Promise.resolve(objects);
    });
  }
  
  static deleteById(id, options) {
    return this.client.deleteById(id, options);
  }
  
  static updateById(id, updates, options) {
    return this.client.updateById(id, updates, options);
  }
  
  static count(filters, options) {
    return this.client.count(filters, options);
  }
  
  static update(filters, updates, options) {
    return this.client.update(filters, updates, options);
  }
  
};