# Fastify Enforce Schema

[![NPM version](https://img.shields.io/npm/v/fastify-enforce-schema.svg?style=flat)](https://www.npmjs.com/package/fastify-enforce-schema)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://standardjs.com/)

<p align="center">
  <img width="250" src="./assets/images/badge.png">
</p>

This plugin enables you to enforce `response`, `body` and `params` schemas on your controllers. The sentiment behind this is that no endpoint should ever be left without validation, and now you can enforce this on your application level, so no endpoints are released without the validation.

The plugin works by "hooking" into the [`onRoute hook`](https://www.fastify.io/docs/latest/Reference/Hooks/#onroute) which as described in the docs, triggers when a new route is registered.

_This plugin is built together with our [Programmer Network](https://programmer.network/) Community. You can join us on [Twitch](https://twitch.tv/programmer_network) and [Discord](https://discord.gg/ysnpXnY7ba)._

## Install

Using [npm](https://nodejs.org/en/):

- `npm i fastify-enforce-schema`

Using [yarn](https://yarnpkg.com/):

- `yarn add fastify-enforce-schema`

## Usage

Route definitions in Fastify (4.x) are synchronous, so you must ensure that this plugin is registered before your route definitions.

```js
// ESM
import Fastify from 'fastify'
import enforceSchema from 'fastify-enforce-schema'

const fastify = Fastify()
await fastify.register(enforceSchema, { 
  // options
})
```
> _Note_: top-level await requires Node.js 14.8.0 or later

```js
// CommonJS
const fastify = require('fastify')()
const enforceSchema = require('fastify-enforce-schema')

fastify.register(enforceSchema, { 
  // options
})
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

- **exclude**: Endpoints to exclude by the `routeOptions.path`. Each exclude is an object with a `url` and (optional) `excludeSchemas` array. If the `excludeSchemas` array is not passed, validation for all 3 schemas (`body`, `response`, `params`) is disabled.

By default, all schemas are enforced where appropriate.

> _Note_: The `body` schema is only enforced on POST, PUT and PATCH routes, and the `params` schema is only enforced on routes with `:params`.

### Disable schema enforcement on specific routes

```js
// Exclude all schemas
fastify.get('/foo', { schema: false }, (req, reply) => {
  reply.code(200)
})

// Exclude response and params schemas
fastify.get(
  '/bar:baz',
  { schema: { response: false, params: false } },
  (req, reply) => {
    reply.code(200)
  }
)

// Exclude body schema
fastify.post('/baz', { schema: { body: false } }, (req, reply) => {
  reply.code(200)
})
```
