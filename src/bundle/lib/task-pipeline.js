'use strict';

const Promise = require('bluebird');

const Restypie = require('../../');

const STOP = Symbol('STOP');

class Pipeline {

  get bundle() { return this._bundle; }
  get exit() { return this._exit; }
  get context() { return this._context; }

  constructor(options) {
    options = options || {};
    
    Restypie.Utils.assertIsInstanceOf(options.exit, Function);
    Restypie.Utils.assertIsInstanceOf(options.bundle, Restypie.Bundle);
    
    this._bundle = options.bundle;
    
    if (options.context) {
      this._context = options.context;
      options.exit = options.exit.bind(this._context);
    }
    
    this._exit = () => {
      this._ran = true;
      return options.exit(this._bundle);
    };
    
    this._tasks = [];
    this._isRunning = false;
    this._ran = false;
  }

  add(task) {
    this._tasks.push(task);
    return this;
  }

  _getNext() {
    let next = this._tasks.shift() || this._exit;
    if (this._context) next = next.bind(this._context);
    return next;
  }

  run() {
    if (this._isRunning || this._ran) return Promise.reject(new Error('Cannot run pipeline more then once'));
    return this._run();
  }
  
  stop() {
    return Promise.resolve(STOP);
  }

  _run() {
    if (this._ran) return Promise.resolve(this._bundle);

    this._isRunning = true;

    return Promise.try(() => {
      return this._getNext()(this._bundle);
    }).then((stop) => {
      if (stop === STOP) return this._exit(this._bundle);
      return this._run();
    }).catch((err) => {
      this._bundle.setError(err);
      return this._exit(this._bundle);
    }).catch((err) => {
      Restypie.Logger.error(`Couldn't respond properly : ${err.stack || err}`);
      Restypie.EventEmitter.emit('error', `Couldn't respond properly : ${err.stack || err}`);
      const res = this._bundle.res;
      res.statusCode = Restypie.Codes.InternalServerError;
      res.end(`Something went wrong : ${err.message}`);
    });
  }

}

module.exports = Pipeline;