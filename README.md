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
  Note that the body schema will only be enforced on POST, PUT and PATCH HTTPS verbs

- **exclude**: Endpoints to exclude by the _routeOptions.path_. Each exclude is an object, with a `url` and optional, `excludeSchemas` array. If the `excludeSchemas` array is not passed, validation for all 3 schemas (`body`, `respone`, `params`) is disabled.
