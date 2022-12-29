# Fastify Enforce Schema

<p align="center">
  <img width="250" src="./assets/images/badge.png">
</p>

This plugin enables you to enforce `response`, `body` and `params` schemas on your controllers. The sentiment behind this is that no endpoint should ever be left without validation, and now you can enforce this on your application level, so no endpoints are released without the validation.

The plugin works by `"hooking"` into [`onRoute hook`](https://www.fastify.io/docs/latest/Reference/Hooks/#onroute) which as described in the docs, triggers when a new route is registered.

_This plugin is built together with our [Programmer Network](https://programmer.network/) Community. You can join us on [Twitch](https://twitch.tv/programmer_network) and [Discord](https://discord.gg/ysnpXnY7ba)._

## Install

Using [npm](https://nodejs.org/en/):

- `npm i fastify-enforce-schema`

Using [yarn](https://yarnpkg.com/):

- `yarn add fastify-enforce-schema`

## Usage

```js
import fastify from "fastify";
import enforceSchema from "fastify-enforce-schema";

const options = {
  required: ["response", "body", "params"], // available schemas that you'd want to enforce
  exclude: [{ url: "/api/v1/foo/:bar", excludedSchemas: ["body"] }],
  // don't enforce body schema validation for a path /api/v1/foo/:bar
};

fastify.register(enforceSchema, options);
```

## Options

- **required**: response, body or params

  _Note_ - The body schema will only be enforced on POST, PUT and PATCH

- **exclude**: Endpoints to exclude by the _routeOptions.path_. Each exclude is an object, with a `url` and optional, `excludeSchemas` array. If the `excludeSchemas` array is not passed, validation for all 3 schemas (`body`, `respone`, `params`) is disabled.

### **Excluding specific schemas**

To disable schema validation for all three types (response, body, and params), you can set { schema: false }. If you only want to disable the schema for a specific type, you can do so by setting the corresponding key to false. For example, to disable schema validation for the response, you can use { response: false }.

```js
await fastify.register(enforceSchema, {
  required: ["response", "body", "params"],
});

fastify.get("/foo", { schema: false }, (req, reply) => {
  reply.code(200);
});

fastify.get(
  "/bar",
  { schema: { response: false, body: false, params: false } },
  (req, reply) => {
    reply.code(200);
  }
);
```
