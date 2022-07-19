const controller = require('../../controller');
const generalroleService = require('./generalroleService');
const generalroleValidation = require('./generalroleValidation');

const isRoleAvailable = async (req, res) => {
  await controller(req, res, {
    validator: generalroleValidation.isRoleAvailableValidation,
    service: generalroleService.isRoleAvailable,
  });
};

const getRolePermissions = async (req, res) => {
  await controller(req, res, {
    validator: generalroleValidation.accountIdValidation,
    service: generalroleService.getRolePermissions,
  });
};

const createRole = async (req, res) => {
  await controller(req, res, {
    validator: generalroleValidation.createGeneralRoleValidation,
    service: generalroleService.createRole,
  });
};

const editRole = async (req, res) => {
  await controller(req, res, {
    validator: generalroleValidation.editGeneralRoleValidation,
    service: generalroleService.editRole,
  });
};

const deleteRole = async (req, res) => {
  await controller(req, res, {
    validator: generalroleValidation.deleteGeneralRoleValidation,
    service: generalroleService.deleteRole,
  });
};

const index = async (req, res) => {
  await controller(req, res, {
    validator: generalroleValidation.indexGeneralRolesValidation,
    service: generalroleService.index,
  });
};

module.exports = {
  isRoleAvailable,
  getRolePermissions,
  createRole,
  editRole,
  deleteRole,
  index,
};
