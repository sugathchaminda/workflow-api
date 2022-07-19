const controller = require('../../controller');
const {
  addDimensionsValidation,
  updateDimensionsValidation,
  deleteDimensionsValidation,
} = require('./dimensionValidation');
const {
  addDimensions: addDimensionsService,
  updateDimensions: updateDimensionsService,
  deleteDimensions: deleteDimensionsService,
} = require('./dimensionService');

const addDimensions = async (req, res) => {
  await controller(req, res, {
    validator: addDimensionsValidation,
    service: addDimensionsService,
  });
};

const updateDimensions = async (req, res) => {
  await controller(req, res, {
    validator: updateDimensionsValidation,
    service: updateDimensionsService,
  });
};

const deleteDimensions = async (req, res) => {
  await controller(req, res, {
    validator: deleteDimensionsValidation,
    service: deleteDimensionsService,
  });
};

module.exports = {
  addDimensions,
  updateDimensions,
  deleteDimensions,
};
