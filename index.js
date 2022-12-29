const fp = require('fastify-plugin')
const {
  getErrrorMessage,
  hasProperties,
  initialExcludes,
  isSchemaTypeExcluded,
  SCHEMA_TYPES
} = require('./utils')

function FastifyEnforceSchema (fastify, opts, done) {
  if (!opts) {
    opts = {}
  }

  if (!Object.prototype.hasOwnProperty.call(opts, 'required')) {
    opts.required = []
  }

  if (!Object.prototype.hasOwnProperty.call(opts, 'exclude')) {
    opts.exclude = []
  }

  const { required, exclude } = opts

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
      ({ url }) => url === routeOptions.path
    )

    const hasSchemas =
      typeof excludedEntity === 'object' &&
      Object.prototype.hasOwnProperty.call(excludedEntity, 'excludedSchemas')

    if (excludedEntity && !hasSchemas) {
      done()
      return
    }

    if (!routeOptions?.schema) {
      throw new Error(
        `schema missing at the path ${routeOptions.method}: "${routeOptions.path}"`
      )
    }

    if (
      routeOptions?.schema?.response !== false &&
      !isSchemaTypeExcluded(excludedEntity, SCHEMA_TYPES.response) &&
      required.indexOf(SCHEMA_TYPES.response) !== -1
    ) {
      const schema = Object.keys(routeOptions?.schema?.response || [])

      if (!routeOptions?.schema?.response) {
        throw new Error(getErrrorMessage(SCHEMA_TYPES.response, routeOptions))
      }

      if (
        routeOptions?.schema?.response &&
        !Object.keys(routeOptions?.schema?.response || []).length
      ) {
        throw new Error('No HTTP status codes provided in the response schema')
      }

      schema.forEach((value) => {
        if (!Number.isInteger(parseInt(value, 10))) {
          throw new Error(
            `"${value}" is not a number. HTTP status codes from 100 - 599 supported`
          )
        }

        if (value < 100 || value > 599) {
          throw new Error('HTTP status codes from 100 - 599 supported')
        }
      })
    }
    if (
      routeOptions?.schema?.body !== false &&
      !isSchemaTypeExcluded(excludedEntity, SCHEMA_TYPES.body) &&
      ['POST', 'PUT', 'PATCH'].includes(routeOptions.method) &&
      required.indexOf(SCHEMA_TYPES.body) !== -1 &&
      !hasProperties(routeOptions, SCHEMA_TYPES.body)
    ) {
      throw new Error(getErrrorMessage(SCHEMA_TYPES.body, routeOptions))
    }

    if (
      routeOptions?.schema?.params !== false &&
      new RegExp(/:\w+/).test(routeOptions.url) &&
      !isSchemaTypeExcluded(excludedEntity, SCHEMA_TYPES.params) &&
      required.indexOf(SCHEMA_TYPES.params) !== -1 &&
      !hasProperties(routeOptions, SCHEMA_TYPES.params)
    ) {
      throw new Error(getErrrorMessage(SCHEMA_TYPES.params, routeOptions))
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
