const ErrorPrefix = 'FastifyEnforceSchema'
exports.ErrorPrefix = ErrorPrefix

const SCHEMA_TYPES = {
  response: 'response',
  body: 'body',
  params: 'params'
}
exports.SCHEMA_TYPES = SCHEMA_TYPES

exports.getErrorMessage = (data, routeOptions) => {
  const { path, method } = routeOptions
  if (data?.schema) {
    return `${ErrorPrefix}: ${method}: ${path} is missing a schema`
  }
  if (data?.schemaType) {
    return `${ErrorPrefix}: ${method}: ${path} is missing a ${data.schemaType} schema`
  }
  return `${ErrorPrefix}: In ${method}: ${path}, ${data?.message}.`
}

exports.hasProperties = (routeOptions, key, subKey = null) => {
  if (!subKey) {
    return !!Object.keys(routeOptions?.schema?.[key] || []).length
  }
  return !!Object.keys(routeOptions?.schema?.[key]?.[subKey] || []).length
}

exports.isSchemaTypeExcluded = (excludedEntity, schemaType) => {
  return excludedEntity?.excludedSchemas?.includes(schemaType) || false
}

exports.isSchemaDisabled = (disabled) => {
  return Object.values(SCHEMA_TYPES).every((schemaType) =>
    disabled.includes(schemaType)
  )
}

exports.initialExcludes = [
  {
    url: '/docs'
  },
  {
    url: '/docs/uiConfig'
  },
  {
    url: '/docs/initOAuth'
  },
  {
    url: '/docs/json'
  },
  {
    url: '/docs/yaml'
  },
  {
    url: '/docs/*'
  },
  {
    url: '/docs/static/*'
  }
]
