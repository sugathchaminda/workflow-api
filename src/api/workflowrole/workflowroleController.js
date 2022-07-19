const controller = require('../../controller');
const workflowroleService = require('./workflowroleService');
const workflowroleValidation = require('./workflowroleValidation');

const isRoleAvailable = async (req, res) => {
  await controller(req, res, {
    validator: workflowroleValidation.isRoleAvailableValidation,
    service: workflowroleService.isRoleAvailable,
  });
};

const getRolePermissions = async (req, res) => {
  await controller(req, res, {
    validator: workflowroleValidation.accountIdValidation,
    service: workflowroleService.getRolePermissions,
  });
};

const createRole = async (req, res) => {
  await controller(req, res, {
    validator: workflowroleValidation.createWorkflowRoleValidation,
    service: workflowroleService.createRole,
  });
};

const index = async (req, res) => {
  await controller(req, res, {
    validator: workflowroleValidation.accountIdValidation,
    service: workflowroleService.index,
  });
};

const editRole = async (req, res) => {
  await controller(req, res, {
    validator: workflowroleValidation.editWorkflowRoleValidation,
    service: workflowroleService.editWorkflowRole,
  });
};

const validateDeleteRole = async (req, res) => {
  await controller(req, res, {
    validator: workflowroleValidation.deleteWorkflowRoleValidation,
    service: workflowroleService.validateDeleteWorkflowRole,
  });
};

const deleteRole = async (req, res) => {
  await controller(req, res, {
    validator: workflowroleValidation.deleteWorkflowRoleValidation,
    service: workflowroleService.deleteRole,
  });
};

module.exports = {
  isRoleAvailable,
  getRolePermissions,
  createRole,
  index,
  editRole,
  validateDeleteRole,
  deleteRole,
};
