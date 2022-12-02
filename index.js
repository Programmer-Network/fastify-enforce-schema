const fp = require("fastify-plugin");
const { getErrrorMessage, hasProperties, initialExcludes } = require("./utils");

function FastifyEnforceSchema(fastify, opts, done) {
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
    if (
      [...initialExcludes, ...exclude].includes(routeOptions.url) ||
      routeOptions.path === "*" ||
      !routeOptions.path
    ) {
      done();
      return;
    }

    if (!routeOptions?.schema) {
      throw new Error(`schema missing at the path "${routeOptions.path}"`);
    }

    if (required.indexOf("response") !== -1) {
      const schema = Object.keys(routeOptions?.schema?.response || []);

      if (!routeOptions?.schema?.response) {
        throw new Error(getErrrorMessage("response", routeOptions.path));
      }

      if (
        routeOptions?.schema?.response &&
        !Object.keys(routeOptions?.schema?.response || []).length
      ) {
        throw new Error(`No HTTP status codes provided in the response schema`);
      }

      schema.forEach(value => {
        if (!Number.isInteger(parseInt(value, 10))) {
          throw new Error(
            `"${value}" is not a number. HTTP status codes from 100 - 599 supported`
          );
        }

        if (value < 100 || value > 599) {
          throw new Error(`HTTP status codes from 100 - 599 supported`);
        }
      });
    }

    if (
      ["POST", "PUT", "PATCH"].includes(routeOptions.method) &&
      required.indexOf("body") !== -1 &&
      !hasProperties(routeOptions, "body")
    ) {
      throw new Error(getErrrorMessage("body", routeOptions.path));
    }

    if (
      required.indexOf("params") !== -1 &&
      !hasProperties(routeOptions, "params")
    ) {
      throw new Error(getErrrorMessage("params", routeOptions.path));
    }
  });

  done();
}

const _fastifyEnforceSchema = fp(FastifyEnforceSchema, {
  fastify: "4.x",
  name: "fastify-enforce-schema",
});

module.exports = _fastifyEnforceSchema;
module.exports.FastifyEnforceSchema = _fastifyEnforceSchema;
module.exports.default = _fastifyEnforceSchema;
