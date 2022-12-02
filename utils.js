const getErrrorMessage = (schemaType, path) => {
  return `${path} is missing a ${schemaType} schema`;
};

exports.getErrrorMessage = getErrrorMessage;

exports.hasProperties = (routeOptions, name) => {
  return !!Object.keys(routeOptions?.schema?.[name]?.properties || []).length;
};

exports.initialExcludes = [
  "/docs",
  "/docs/",
  "/docs/uiConfig",
  "/docs/initOAuth",
  "/docs/json",
  "/docs/yaml",
  "/docs/*",
  "/docs/static/*",
];
