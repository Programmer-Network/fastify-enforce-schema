exports.getErrrorMessage = (schemaType, path) => {
  return `${path} is missing a ${schemaType} schema`;
};

exports.hasProperties = (routeOptions, name) => {
  if (name === "response") {
    const schema = Object.keys(routeOptions?.schema?.[name]);

    if(!schema.length) {
      throw new Error(`No HTTP status codes provided in the response schema`)
    }

    if(schema.forEach(value) => {
      if(!Number.isInteger(value)) {
        throw new Error(`${value} is not a number. HTTP status codes from 100 - 599 supported`)
      }

      if(value < 100 || value > 599) {
        throw new Error(`HTTP status codes from 100 - 599 supported`)
      }
    })

    return true;
  }

  return !!Object.keys(routeOptions?.schema?.[name]?.properties || []).length;
};

