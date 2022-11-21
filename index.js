const fp = require("fastify-plugin");
const { getErrrorMessage } = require("./utils");

function FastifyEnforceSchema(fastify, opts, next) {
  if (!opts) {
    opts = {};
  }

  if (!Object.prototype.hasOwnProperty.call(opts, "required")) {
    opts.required = [];
  }

  if (!Object.prototype.hasOwnProperty.call(opts, "exclude")) {
    opts.exclude = [];
  }

  const { required, exclude } = opts;

  fastify.addHook("onRoute", routeOptions => {
    if (exclude.includes(routeOptions.url) || routeOptions.path === "*") {
      next();
      return;
    }

    if (required.indexOf("response") !== -1 && !routeOptions.schema?.response) {
      throw new Error(getErrrorMessage("response", routeOptions.path));
    }

    if (
      ["POST", "PUT", "PATCH"].includes(routeOptions.method) &&
      required.indexOf("body") !== -1 &&
      !routeOptions.schema?.body
    ) {
      throw new Error(getErrrorMessage("body", routeOptions.path));
    }

    if (required.indexOf("params") !== -1 && !routeOptions.schema?.params) {
      throw new Error(getErrrorMessage("params", routeOptions.path));
    }
  });

  next();
}

const _fastifyEnforceSchema = fp(FastifyEnforceSchema, {
  fastify: "4.x",
  name: "@fastify/enforce-schema",
});

module.exports = _fastifyEnforceSchema;
module.exports.FastifyEnforceSchema = _fastifyEnforceSchema;
module.exports.default = _fastifyEnforceSchema;
