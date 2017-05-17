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
const restypieExpress = require('restypie-express')

const app = express();

const v1 = new Restypie.API(restypieExpress(router, {
  path: 'v1'
}));

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

const v1 = new Restypie.API(restypieKoaRouter(router, {
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

const v1 = new Restypie.API(restypieKoaRouter(router, {
  path: 'v1'
}));


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
