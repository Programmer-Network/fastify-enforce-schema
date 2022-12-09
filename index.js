const fp = require("fastify-plugin");
const {
  getErrrorMessage,
  hasProperties,
  initialExcludes,
  isSchemaTypeExcluded,
  SCHEMA_TYPES,
  isHTTPVerbExcluded,
} = require("./utils");

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

  if (!Object.prototype.hasOwnProperty.call(opts, 'excludeOnFalseSchema')) {
    opts.excludeOnFalseSchema = false;
  }

  const { required, exclude, excludeOnFalseSchema } = opts;

  fastify.addHook("onRoute", (routeOptions) => {
    if (
      routeOptions.path === "*" ||
      !routeOptions.path ||
      (excludeOnFalseSchema && routeOptions.schema === false)
    ) {
      done();
      return;
    }

    if (excludeOnFalseSchema && typeof routeOptions.schema === "object") {
      const excludedEntity = exclude.find(
        ({ url }) => url === routeOptions.path
      );
      const excludedSchemas = [];

      Object.entries(routeOptions.schema).forEach(([key, value]) => {
        if (value === false) {
          excludedSchemas.push(key);
        }
      });

      if (excludedEntity) {
        excludedEntity.excludedSchemas = [
          ...new Set([...excludedEntity.excludedSchemas, ...excludedSchemas]),
        ];
      } else {
        exclude.push({ url: routeOptions.path, excludedSchemas });
      }
    }

    const excludedEntity = [...initialExcludes, ...exclude].find(
      ({ url }) => url === routeOptions.path
    );

    const hasSchemas =
      typeof excludedEntity === "object" &&
      Object.prototype.hasOwnProperty.call(excludedEntity, "excludedSchemas");

    if (excludedEntity && !hasSchemas) {
      done();
      return;
    }

    if (!routeOptions?.schema) {
      throw new Error(
        `schema missing at the path ${routeOptions.method}: "${routeOptions.path}"`
      );
    }

    if (
      !isSchemaTypeExcluded(excludedEntity, SCHEMA_TYPES.response) &&
      required.indexOf(SCHEMA_TYPES.response) !== -1
    ) {
      const schema = Object.keys(routeOptions?.schema?.response || []);

      if (!routeOptions?.schema?.response) {
        throw new Error(getErrrorMessage(SCHEMA_TYPES.response, routeOptions));
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
      !isSchemaTypeExcluded(excludedEntity, SCHEMA_TYPES.body) &&
      ["POST", "PUT", "PATCH"].includes(routeOptions.method) &&
      required.indexOf(SCHEMA_TYPES.body) !== -1 &&
      !hasProperties(routeOptions, SCHEMA_TYPES.body)
    ) {
      throw new Error(getErrrorMessage(SCHEMA_TYPES.body, routeOptions));
    }

    if (
      !isSchemaTypeExcluded(excludedEntity, SCHEMA_TYPES.params) &&
      required.indexOf(SCHEMA_TYPES.params) !== -1 &&
      !hasProperties(routeOptions, SCHEMA_TYPES.params)
    ) {
      throw new Error(getErrrorMessage(SCHEMA_TYPES.params, routeOptions));
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
