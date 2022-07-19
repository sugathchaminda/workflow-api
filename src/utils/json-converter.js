const { snakeCase, isArray, isObject } = require('lodash');

function convert(obj, changeCase) {
  let newObject;

  if (!isObject(obj)) {
    return obj;
  }

  if (isArray(obj)) {
    newObject = obj.map((element) => convert(element, changeCase));
  } else {
    newObject = {};
    Object.keys(obj).forEach((oldKey) => {
      const newKey = changeCase(oldKey);
      newObject[newKey] = convert(obj[oldKey], changeCase);
    });
  }

  return newObject;
}

function toSnakeCase(obj) {
  return convert(obj, snakeCase);
}

module.exports = {
  toSnakeCase,
};
