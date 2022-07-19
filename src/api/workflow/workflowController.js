const controller = require('../../controller');
const workflowValidation = require('./workflowValidation');
const workflowService = require('./workflowService');

const toggleWorkflow = async (req, res) => {
  await controller(req, res, {
    validator: workflowValidation.accountIdValidation,
    service: workflowService.toggleWorkflow,
  });
};

const validateAlias = async (req, res) => {
  await controller(req, res, {
    validator: workflowValidation.validateAlias,
    service: workflowService.validateAlias,
  });
};

const fetchRoles = async (req, res) => {
  await controller(req, res, {
    validator: workflowValidation.fetchRoles,
    service: workflowService.fetchRoles,
  });
};

const fetchUsersForRoleId = async (req, res) => {
  await controller(req, res, {
    validator: workflowValidation.fetchUsersForRoleId,
    service: workflowService.fetchUsersForRoleId,
  });
};

module.exports = {
  toggleWorkflow,
  validateAlias,
  fetchRoles,
  fetchUsersForRoleId,
};
