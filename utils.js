const getErrorMessage = (schemaType, routeOptions) => {
  const { path, method } = routeOptions
  return `${method}: ${path} is missing a ${schemaType} schema`
}

exports.getErrorMessage = getErrorMessage

exports.hasProperties = (routeOptions, name) => {
  return !!Object.keys(routeOptions?.schema?.[name]?.properties || []).length
}

exports.isSchemaTypeExcluded = (excludedEntity, schemaType) => {
  return excludedEntity?.excludedSchemas?.includes(schemaType) || false
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

exports.SCHEMA_TYPES = {
  response: 'response',
  body: 'body',
  params: 'params'
}
