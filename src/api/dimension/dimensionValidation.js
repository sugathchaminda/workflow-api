const { clean, validate } = require('../../utils/validationHelper');
const {
  addDimensions: addDimensionsSchema,
  updateDimensions: updateDimensionsSchema,
  deleteDimensions: deleteDimensionsValidationSchema,
} = require('./dimensionSchema');

const addDimensionsValidation = async (req) => {
  const attributeList = Array.isArray(req.body) ? req.body : [req.body];
  const attributes = attributeList.map((item) => clean({
    accountId: req.params.accountId,
    objectId: item.objectId,
    objectType: item.objectType,
    dimensions: item.dimensions,
    user: req.user, // fetch user from cookie
    supplier: req.supplier,
  }));

  return validate(attributes, addDimensionsSchema);
};

const updateDimensionsValidation = async (req) => {
  const attributeList = Array.isArray(req.body) ? req.body : [req.body];
  const attributes = attributeList.map((item) => clean({
    accountId: req.params.accountId,
    objectId: item.objectId,
    objectType: item.objectType,
    dimensions: item.dimensions,
    user: req.user, // fetch user from cookie
    supplier: req.supplier,
  }));

  return validate(attributes, updateDimensionsSchema);
};

const deleteDimensionsValidation = async (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    invoiceId: req.params.invoiceId,
    tagIds: req.body.ids,
  });

  return validate(attributes, deleteDimensionsValidationSchema);
};

module.exports = {
  addDimensionsValidation,
  updateDimensionsValidation,
  deleteDimensionsValidation,
};
