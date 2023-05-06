const fp = require('fastify-plugin')
const {
  ErrorPrefix,
  getErrorMessage,
  hasProperties,
  initialExcludes,
  isSchemaTypeExcluded,
  SCHEMA_TYPES,
  isSchemaDisabled
} = require('./utils')

function FastifyEnforceSchema (fastify, opts, done) {
  if (!Object.prototype.hasOwnProperty.call(opts, 'disabled')) {
    opts.disabled = []
  }
  if (
    opts.disabled === true ||
    (Array.isArray(opts.disabled) && isSchemaDisabled(opts.disabled))
  ) {
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

    const excludedEntity = [...initialExcludes, ...exclude].find(({ url }) =>
      new RegExp(url).test(routeOptions.path)
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
      Object.prototype.hasOwnProperty.call(routeOptions.schema, 'disabled') &&
      !Array.isArray(routeOptions.schema.disabled)
    ) {
      throw new Error(
        getErrorMessage(
          { message: 'schema.disabled must be an array' },
          routeOptions
        )
      )
    }

    if (
      routeOptions?.schema?.response !== false &&
      !routeOptions?.schema?.disabled?.includes(SCHEMA_TYPES.response) &&
      !isSchemaTypeExcluded(excludedEntity, SCHEMA_TYPES.response) &&
      disabled.indexOf(SCHEMA_TYPES.response) === -1
    ) {
      const responseKeys = Object.keys(routeOptions?.schema?.response || {})

      if (!routeOptions?.schema?.response) {
        throw new Error(
          getErrorMessage({ schemaType: SCHEMA_TYPES.response }, routeOptions)
        )
      }

      if (routeOptions?.schema?.response && !responseKeys.length) {
        throw new Error(
          getErrorMessage(
            {
              message:
                'no HTTP status codes were provided in the response schema'
            },
            routeOptions
          )
        )
      }

      responseKeys.forEach((value) => {
        if (
          value === 'default' ||
          ['1xx', '2xx', '3xx', '4xx', '5xx'].includes(value) ||
          (value >= 100 && value <= 599)
        ) {
          if (hasProperties(routeOptions, SCHEMA_TYPES.response, value)) {
            done()
            return
          }

          throw new Error(
            getErrorMessage(
              {
                message: `schema ${SCHEMA_TYPES.response} key "${value}" must be a non-empty object`
              },
              routeOptions
            )
          )
        }

        if (Number.isInteger(parseInt(value, 10))) {
          throw new Error(
            getErrorMessage(
              {
                message: `schema ${SCHEMA_TYPES.response} key "${value}" must be a valid HTTP code which ranges from 100 - 599`
              },
              routeOptions
            )
          )
        }

        throw new Error(
          getErrorMessage(
            {
              message: `"${value}" is not \`default\` or a supported HTTP status code`
            },
            routeOptions
          )
        )
      })
    }

    // NOTE: Deprecation will be removed in the next version
    if (routeOptions?.schema?.body === false) {
      process.emitWarning(
        `[${ErrorPrefix}] Setting "schema.body" to false is deprecated. Please use the "schema.disabled" option instead.`,
        'DeprecationWarning'
      )
      if (Array.isArray(routeOptions.schema.disabled)) {
        if (routeOptions.schema.disabled.indexOf(SCHEMA_TYPES.body) === -1) {
          routeOptions.schema.disabled.push(SCHEMA_TYPES.body)
        }
      } else {
        routeOptions.schema.disabled = [SCHEMA_TYPES.body]
      }
      delete routeOptions?.schema.body
    }

    if (
      !routeOptions?.schema?.disabled?.includes(SCHEMA_TYPES.body) &&
      !isSchemaTypeExcluded(excludedEntity, SCHEMA_TYPES.body) &&
      ['POST', 'PUT', 'PATCH'].includes(routeOptions.method) &&
      disabled.indexOf(SCHEMA_TYPES.body) === -1 &&
      !hasProperties(routeOptions, SCHEMA_TYPES.body)
    ) {
      throw new Error(
        getErrorMessage({ schemaType: SCHEMA_TYPES.body }, routeOptions)
      )
    }

    // NOTE: Deprecation will be removed in the next version
    if (routeOptions?.schema?.params === false) {
      process.emitWarning(
        `[${ErrorPrefix}] Setting "schema.params" to false is deprecated. Please use the "schema.disabled" option instead.`,
        'DeprecationWarning'
      )
      if (Array.isArray(routeOptions.schema.disabled)) {
        if (routeOptions.schema.disabled.indexOf(SCHEMA_TYPES.params) === -1) {
          routeOptions.schema.disabled.push(SCHEMA_TYPES.params)
        }
      } else {
        routeOptions.schema.disabled = [SCHEMA_TYPES.params]
      }
      delete routeOptions?.schema.params
    }

    if (
      !routeOptions?.schema?.disabled?.includes(SCHEMA_TYPES.params) &&
      /:\w+/.test(routeOptions.url) &&
      !isSchemaTypeExcluded(excludedEntity, SCHEMA_TYPES.params) &&
      disabled.indexOf(SCHEMA_TYPES.params) === -1 &&
      !hasProperties(routeOptions, SCHEMA_TYPES.params)
    ) {
      throw new Error(
        getErrorMessage({ schemaType: SCHEMA_TYPES.params }, routeOptions)
      )
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
