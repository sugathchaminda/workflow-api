const controller = require('../../controller');
const inviteValidation = require('./inviteValidation');
const inviteService = require('./inviteService');

const addInviteWorkflowAndAlias = async (req, res) => {
  await controller(req, res, {
    validator: inviteValidation.addInviteWorkflowAndAlias,
    service: inviteService.addInviteWorkflowAndAlias,
  });
};

const fetchInviteWorkflowInfo = async (req, res) => {
  await controller(req, res, {
    validator: inviteValidation.fetchInviteWorkflowInfo,
    service: inviteService.fetchInviteWorkflowInfo,
  });
};

const deleteInviteWorkflowInfo = async (req, res) => {
  await controller(req, res, {
    validator: inviteValidation.deleteInviteWorkflowInfo,
    service: inviteService.deleteInviteWorkflowInfo,
  });
};

const addWorkflowInfoForAcceptedUser = async (req, res) => {
  await controller(req, res, {
    validator: inviteValidation.addWorkflowInfoForAcceptedUser,
    service: inviteService.addWorkflowInfoForAcceptedUser,
  });
};

module.exports = {
  addInviteWorkflowAndAlias,
  fetchInviteWorkflowInfo,
  deleteInviteWorkflowInfo,
  addWorkflowInfoForAcceptedUser,
};
