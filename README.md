# fastify-enforce-schema

This plugin enables you to enforce _response_, _body_ or _params_ schemas on your controllers. The sentiment behind this is that no endpoint should ever be left without validation, and now you can enforce this on your application level, so no endpoints are released without the validation.

## Install

> npm i fastify-enforce-schema

> yarn add fastify-enforce-schema

## Usage

```js
const fastify = require("fastify")();
const enforceSchema = require("fastify-enforce-schema");

const options = {
  required: ["response", "body", "params"], // available schemas that you'd want to enforce
  exclude: [{ url: "/api/v1/foo/:bar", excludedSchemas: ["body"] }],
  // don't enforce body schema validation for a path /api/v1/foo/:bar
};

fastify.register(enforceSchema, options);
```

### options

- **required**: response, body or params

  _Note_ - The body schema will only be enforced on POST, PUT and PATCH

- **exclude**: Endpoints to exclude by the _routeOptions.path_. Each exclude is an object, with a `url` and optional, `excludeSchemas` array. If the `excludeSchemas` array is not passed, validation for all 3 schemas (`body`, `respone`, `params`) is disabled.

- **excludeOnFalseSchema** - If your controllers aren't returning anything, make sure to set the `response` schema to false. And then, set `excludeOnFalseSchema` to `true`, so that this plugin doesn't return errors for any given controller that has a response schema set to false.

```js
await fastify.register(enforceSchema, {
  required: ["response"],
  excludeOnFalseSchema: true,

fastify.get("/foo", { schema: { response: false } }, (req, reply) => {
  reply.code(200).send("exclude works");
});
```
