const controller = require('../../controller');
const userValidation = require('./userValidation');
const userService = require('./userService');

const fetchUsersRolesAndAliases = async (req, res) => {
  await controller(req, res, {
    validator: userValidation.fetchUsersRolesAndAliases,
    service: userService.fetchUsersRolesAndAliases,
  });
};

const updateUsersRolesAndAliases = async (req, res) => {
  await controller(req, res, {
    validator: userValidation.updateUsersRolesAndAliases,
    service: userService.updateUsersRolesAndAliases,
  });
};

const deleteUsersRolesAndAliases = async (req, res) => {
  await controller(req, res, {
    validator: userValidation.deleteUsersRolesAndAliases,
    service: userService.deactivateUser,
  });
};

const validateUserDelete = async (req, res) => {
  await controller(req, res, {
    validator: userValidation.deleteUsersRolesAndAliases,
    service: userService.validateUserDelete,
  });
};

module.exports = {
  fetchUsersRolesAndAliases,
  updateUsersRolesAndAliases,
  deleteUsersRolesAndAliases,
  validateUserDelete,
};
