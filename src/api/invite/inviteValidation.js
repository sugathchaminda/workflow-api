const { clean, validate } = require('../../utils/validationHelper');
const schema = require('./inviteSchema');
const ApplicationError = require('../../utils/ApplicationError');

const addInviteWorkflowAndAlias = async (req) => {
  if (!req.body || !req.body.workflow) {
    throw new ApplicationError({
      message: 'Required parameters missing in the request',
      statusCode: 400,
    });
  }

  const attributes = clean({
    accountId: req.params.accountId,
    inviteId: req.body.inviteId,
    workflow: {
      workflowRole: req.body.workflow.workflowRole || null,
      generalRole: req.body.workflow.generalRole || [],
      workflowAlias: req.body.workflow.workflowAlias || [],
    },
  });

  return validate(attributes, schema.addInviteWorkflowAndAlias);
};

const fetchInviteWorkflowInfo = async (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    inviteIds: req.body.ids,
  });

  return validate(attributes, schema.fetchInviteWorkflowInfo);
};

const deleteInviteWorkflowInfo = async (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    inviteId: req.params.inviteId,
  });

  return validate(attributes, schema.deleteInviteWorkflowInfo);
};

const addWorkflowInfoForAcceptedUser = async (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    inviteId: req.body.inviteId,
    userId: req.body.userId,
  });

  return validate(attributes, schema.addWorkflowInfoForAcceptedUser);
};

module.exports = {
  addInviteWorkflowAndAlias,
  fetchInviteWorkflowInfo,
  deleteInviteWorkflowInfo,
  addWorkflowInfoForAcceptedUser,
};
