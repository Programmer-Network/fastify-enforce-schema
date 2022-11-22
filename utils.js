exports.getErrrorMessage = (schemaType, path) => {
  return `${path} is missing a ${schemaType} schema`;
};

exports.hasProperties = (routeOptions, name) => {
  return !!Object.keys(routeOptions?.schema?.[name]?.properties || []).length;
};
