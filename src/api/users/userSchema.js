const Joi = require('@hapi/joi');

const fetchUsersRolesAndAliases = () => Joi.object().keys({
  accountId: Joi.string().error(new Error('account id is required')),
  userIds: Joi.array()
    .items(Joi.number())
    .error(new Error('ids should be a number array')),
});

const updateUsersRolesAndAliases = () => Joi.object().keys({
  accountId: Joi.string()
    .required()
    .error(new Error('account id is required')),
  userId: Joi.number()
    .required()
    .error(new Error('User id should be a number')),
  workflowRole: Joi.number().allow(null).required(),
  generalRole: Joi.array().items(Joi.number()).required(),
  workflowAlias: Joi.array().items(Joi.string()).required(),
});

const deleteUsersRolesAndAliases = () => Joi.object().keys({
  accountId: Joi.string().error(new Error('account id is required')),
  userId: Joi.number().error(new Error('User id should be a number')),
});

module.exports = {
  fetchUsersRolesAndAliases,
  updateUsersRolesAndAliases,
  deleteUsersRolesAndAliases,
};
