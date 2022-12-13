# fastify-enforce-schema

<p align="center">
  <img width="250" src="./assets/images/badge.png">
</p>

This plugin enables you to enforce `response`, `body` and `params` schemas on your controllers. The sentiment behind this is that no endpoint should ever be left without validation, and now you can enforce this on your application level, so no endpoints are released without the validation.

The plugin works by `"hooking"` into [`onRoute hook`](https://www.fastify.io/docs/latest/Reference/Hooks/#onroute) which as described in the docs, triggers when a new route is registered.

## Install

---

Using [npm](https://nodejs.org/en/):

- `npm i fastify-enforce-schema`

Using [yarn](https://yarnpkg.com/):

- `yarn add fastify-enforce-schema`

## Usage

---

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

---

- **required**: response, body or params

  _Note_ - The body schema will only be enforced on POST, PUT and PATCH

- **exclude**: Endpoints to exclude by the _routeOptions.path_. Each exclude is an object, with a `url` and optional, `excludeSchemas` array. If the `excludeSchemas` array is not passed, validation for all 3 schemas (`body`, `respone`, `params`) is disabled.

- **excludeOnFalseSchema** - If your controllers aren't returning anything, make sure to set the `response` schema to false. And then, set `excludeOnFalseSchema` to `true`, so that this plugin doesn't return errors for any given controller that has a response schema set to false.

```js
await fastify.register(enforceSchema, {
  required: ["response"],
  excludeOnFalseSchema: true,
});

fastify.get("/foo", { schema: { response: false } }, (req, reply) => {
  reply.code(200);
});
```
