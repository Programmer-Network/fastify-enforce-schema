const fp = require('fastify-plugin')
const {
  getErrorMessage,
  hasProperties,
  initialExcludes,
  isSchemaTypeExcluded,
  SCHEMA_TYPES,
  isSchemaDisabled
} = require('./utils')

function FastifyEnforceSchema (fastify, opts, done) {
  if (Object.prototype.hasOwnProperty.call(opts, 'required')) {
    process.emitWarning(
      'The `required` option for fastify-enforce-schema will be removed soon. Since all schemas are enforced by default, consider using the `exclude` option to exclude specific schemas.',
      'DeprecationWarning'
    )
  } else {
    opts.required = []
  }

  if (!Object.prototype.hasOwnProperty.call(opts, 'disabled')) {
    opts.disabled = []
  }
  if (opts.disabled === true || (Array.isArray(opts.disabled) && isSchemaDisabled(opts.disabled))) {
    done()
    return
  }

  if (!Object.prototype.hasOwnProperty.call(opts, 'exclude')) {
    opts.exclude = []
  }

  const { disabled, exclude } = opts

  fastify.addHook('onRoute', (routeOptions) => {
    if (
      routeOptions.path === '*' ||
      !routeOptions.path ||
      routeOptions.schema === false
    ) {
      done()
      return
    }

    const excludedEntity = [...initialExcludes, ...exclude].find(
      ({ url }) => new RegExp(url).test(routeOptions.path)
    )

    const hasSchemas =
      typeof excludedEntity === 'object' &&
      Object.prototype.hasOwnProperty.call(excludedEntity, 'excludedSchemas')

    if (excludedEntity && !hasSchemas) {
      done()
      return
    }

    if (!routeOptions?.schema) {
      throw new Error(getErrorMessage({ schema: true }, routeOptions))
    }

    if (
      routeOptions?.schema?.response !== false &&
      !isSchemaTypeExcluded(excludedEntity, SCHEMA_TYPES.response) &&
      disabled.indexOf(SCHEMA_TYPES.response) === -1
    ) {
      const responseKeys = Object.keys(routeOptions?.schema?.response || {})

      if (!routeOptions?.schema?.response) {
        throw new Error(getErrorMessage({ schemaType: SCHEMA_TYPES.response }, routeOptions))
      }

      if (
        routeOptions?.schema?.response &&
        !responseKeys.length
      ) {
        throw new Error(getErrorMessage({ message: 'No HTTP status codes provided in the response schema' }, routeOptions))
      }

      responseKeys.forEach((value) => {
        if (value === 'default' || ['1xx', '2xx', '3xx', '4xx', '5xx'].includes(value) || (value >= 100 && value <= 599)) {
          if (hasProperties(routeOptions, SCHEMA_TYPES.response, value)) {
            done()
            return
          }

          throw new Error(getErrorMessage({ message: `${SCHEMA_TYPES.response} key "${value}" must be a non-empty object` }, routeOptions))
        }

        if (Number.isInteger(parseInt(value, 10))) {
          throw new Error(getErrorMessage({ message: 'valid HTTP status codes range from 100 - 599' }, routeOptions))
        }

        throw new Error(getErrorMessage({ message: `"${value}" is not "default" or a supported HTTP status code` }, routeOptions))
      })
    }
    if (
      routeOptions?.schema?.body !== false &&
      !isSchemaTypeExcluded(excludedEntity, SCHEMA_TYPES.body) &&
      ['POST', 'PUT', 'PATCH'].includes(routeOptions.method) &&
      disabled.indexOf(SCHEMA_TYPES.body) === -1 &&
      !hasProperties(routeOptions, SCHEMA_TYPES.body)
    ) {
      throw new Error(getErrorMessage({ schemaType: SCHEMA_TYPES.body }, routeOptions))
    }

    if (
      routeOptions?.schema?.params !== false &&
      /:\w+/.test(routeOptions.url) &&
      !isSchemaTypeExcluded(excludedEntity, SCHEMA_TYPES.params) &&
      disabled.indexOf(SCHEMA_TYPES.params) === -1 &&
      !hasProperties(routeOptions, SCHEMA_TYPES.params)
    ) {
      throw new Error(getErrorMessage({ schemaType: SCHEMA_TYPES.params }, routeOptions))
    }
  })

  done()
}

const _fastifyEnforceSchema = fp(FastifyEnforceSchema, {
  fastify: '4.x',
  name: 'fastify-enforce-schema'
})

module.exports = _fastifyEnforceSchema
module.exports.FastifyEnforceSchema = _fastifyEnforceSchema
module.exports.default = _fastifyEnforceSchema
