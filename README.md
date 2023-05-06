# Fastify Enforce Schema

[![NPM version](https://img.shields.io/npm/v/fastify-enforce-schema.svg?style=flat)](https://www.npmjs.com/package/fastify-enforce-schema)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://standardjs.com/)

<p align="center">
  <img width="250" src="./assets/images/badge.png">
</p>

This plugin enables you to enforce `response`, `body` and `params` schemas on your controllers. The sentiment behind this is that no endpoint should ever be left without validation, and now you can enforce this during their registration, so no endpoints are released without validation.

The plugin works by "hooking" into the [`onRoute Fastify hook`](https://www.fastify.io/docs/latest/Reference/Hooks/#onroute) which, as described in the docs, triggers when a new route is registered.

_This plugin is built together with our [Programmer Network](https://programmer.network/) Community. You can join us on [Twitch](https://twitch.tv/programmer_network) and [Discord](https://discord.gg/ysnpXnY7ba)._

## Install

### Requirements

- [Fastify](https://www.npmjs.com/package/fastify) v4.x

### From [`npm`](https://www.npmjs.com/fastify-enforce-schema)

```
npm install fastify-enforce-schema       # npm
yarn add fastify-enforce-schema          # yarn
pnpm add fastify-enforce-schema          # pnpm
bun add fastify-enforce-schema           # bun
```

## Usage

Route definitions in Fastify (4.x) are synchronous, so you must ensure that this plugin is registered before your route definitions.

```js
// ESM
import Fastify from 'fastify'
import enforceSchema from 'fastify-enforce-schema'

const fastify = Fastify()

// Register the plugin
await fastify.register(enforceSchema, { 
  // options (described below)
})

// Register your routes
// your route definitions here...
```
> _Note_: top-level await requires Node.js 14.8.0 or later

```js
// CommonJS
const fastify = require('fastify')()
const enforceSchema = require('fastify-enforce-schema')

// Register the plugin
fastify.register(enforceSchema, { 
  // options (described below)
})

// Register your routes
fastify.register((fastify, options, done) => {
  // your route definitions here...
  
  done()
})

// Plugins are loaded when fastify.listen(), fastify.inject() or fastify.ready() are called
```

## Options

```js
{
  disabled: ['response', 'body', 'params'], // can also be `true`
  exclude: [
    {
      url: '/foo'
    },
    {
      url: '/bar',
      excludeSchemas: ['response'] // [..., 'body', 'params']
    }
  ]
}
```

<!-- - **required**: response, body or params<br /> -->
- **disabled**: Disable specific schemas (`body`, `response`, `params`) or disable the plugin by passing `true`. <br />

- **exclude**: Endpoints to exclude by the `routeOptions.path`. Each exclude is an object with a `url` and (optional) `excludeSchemas` array. If the `excludeSchemas` array is not passed, validation for all 3 schemas (`body`, `response`, `params`) is disabled. Supports wildcards and any other RegEx features.

By default, all schemas are enforced where appropriate.

> _Note_: The `body` schema is only enforced on POST, PUT and PATCH routes, and the `params` schema is only enforced on routes with `:params`.

### Disable schema enforcement on specific routes

```js
// Disable all schemas
fastify.get('/foo', { schema: false }, (req, reply) => {
  reply.code(200)
})

// Disable response and params schemas
fastify.get(
  '/bar:baz', { schema: { disabled: ['response', 'params'] } }, (req, reply) => {
    reply.code(200)
  }
)

// Disable body schema
fastify.post('/baz', { schema: { disabled: ['body'] } }, (req, reply) => {
  reply.code(200)
})
```
