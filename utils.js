const SCHEMA_TYPES = {
  response: 'response',
  body: 'body',
  params: 'params'
}

exports.getErrorMessage = (data, routeOptions) => {
  const { path, method } = routeOptions
  if (data?.schema) {
    return `${method}: ${path} is missing a schema`
  }
  if (data?.schemaType) {
    return `${method}: ${path} is missing a ${data.schemaType} schema`
  }
  return `${method} ${path}: ${data?.message}`
}

exports.hasProperties = (routeOptions, name) => {
  return !!Object.keys(routeOptions?.schema?.[name]?.properties || []).length
}

exports.isSchemaTypeExcluded = (excludedEntity, schemaType) => {
  return excludedEntity?.excludedSchemas?.includes(schemaType) || false
}

exports.isSchemaDisabled = (disabled) => {
  return Object.values(SCHEMA_TYPES).every((schemaType) => disabled.includes(schemaType))
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

exports.SCHEMA_TYPES = SCHEMA_TYPES
