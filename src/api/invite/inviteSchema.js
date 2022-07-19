const Joi = require('@hapi/joi');

const addInviteWorkflowAndAlias = () => Joi.object().keys({
  accountId: Joi.string().error(new Error('accountId is required')),
  inviteId: Joi.number()
    .required()
    .error(new Error('inviteId should be a number')),
  workflow: Joi.object()
    .keys({
      workflowRole: Joi.number().allow(null),
      generalRole: Joi.array()
        .items(Joi.number())
        .error(new Error('generalRole should be a number array')),
      workflowAlias: Joi.array()
        .items(Joi.string())
        .error(new Error('workflowAlias should be a string array')),
    })
    .required(),
});

const fetchInviteWorkflowInfo = () => Joi.object().keys({
  accountId: Joi.string().error(new Error('accountId is required')),
  inviteIds: Joi.array()
    .items(Joi.number())
    .error(new Error('ids should be a number array')),
});

const deleteInviteWorkflowInfo = () => Joi.object().keys({
  accountId: Joi.string().error(new Error('accountId is required')),
  inviteId: Joi.string().error(new Error('inviteId should be a number')),
});

const addWorkflowInfoForAcceptedUser = () => Joi.object().keys({
  accountId: Joi.string().error(new Error('accountId is required')),
  inviteId: Joi.number().error(new Error('inviteId should be a number')),
  userId: Joi.number().error(new Error('userId should be a number')),
});

module.exports = {
  addInviteWorkflowAndAlias,
  fetchInviteWorkflowInfo,
  deleteInviteWorkflowInfo,
  addWorkflowInfoForAcceptedUser,
};
