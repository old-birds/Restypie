# Restypie

[![Build Status](https://travis-ci.org/SylvainEstevez/Restypie.svg?branch=master)](https://travis-ci.org/SylvainEstevez/Restypie)
[![npm version](https://badge.fury.io/js/restypie.svg)](https://badge.fury.io/js/restypie)
[![Coverage Status](https://coveralls.io/repos/github/SylvainEstevez/Restypie/badge.svg?branch=master)](https://coveralls.io/github/SylvainEstevez/Restypie?branch=master)

Tastypie inspired, lightweight and storage agnostic REST resources manager.

## Requirements
- `node` >= 4.x.x

## Frameworks support
Restypie is framework agnostic and allows you to plug the router you prefer :

#### Using express@3

```javascript
const Express = require('express');
const Restypie = require('restypie');

const app = express();

const v1 = new Restypie.API({
  path: 'v1',
  route(path, handler) {
    app[method](path, ...handlers);
  },
  createBundleHandler(url) {
    return function (req, res, next) {
      req.bundle = new Restypie.Bundle({ req, res, url });
      return next();
    };
  }
});

```

#### Using koa@1 (with koa-router)

Note: make sure to install `restypie-koa-router@5.x`

```javascript
const Restypie = require('restypie');
const koa = require('koa');
const KoaRouter = require('koa-router');
const restypieKoaRouter = require('restypie-koa-router');

const app = koa();
const router = new KoaRouter();

const v1 = new Restypie.API(router, restypieKoaRouter({
  path: 'v1' // Options for this api
}));

// Your routes and resources here

app.use(router.routes());
```

#### Using koa@2 (with koa-router)

Note: make sure to install `restypie-koa-router@7.x`

```javascript
const Restypie = require('restypie');
const Koa = require('koa');
const KoaRouter = require('koa-router');

const app = new Koa();
const router = new KoaRouter();

const v1 = new Restypie.API({
  path: 'v1',
  route(method, path, handlers) {
    router[method](path, ...handlers);
  },
  createBundleHandler(url) {
    return async function (ctx, next) {
      if (ctx.request.body) ctx.req.body = this.request.body;
      ctx.req.params = ctx.params;
      ctx.req.query = ctx.query;
      ctx.state.bundle = new Restypie.Bundle({ req: this.req, res: this.res, url });
      await next;
    }; 
  }
});


// Your routes and resources here

app.use(router.routes());
```

## Installation
```
npm install restypie --save
```

## Debugging
Restypie allows debugging by supplying the `DEBUG` variable
```
DEBUG=restypie:* node app.js
```

## Contributing

See [here](./CONTRIBUTING.md).
