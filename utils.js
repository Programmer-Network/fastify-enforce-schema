exports.getErrrorMessage = (schemaType, path) => {
  return `${path} is missing a ${schemaType} schema`
}
