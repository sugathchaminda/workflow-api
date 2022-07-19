const Joi = require('@hapi/joi');

const validateAlias = () => Joi.object().keys({
  accountId: Joi.string().error(new Error('account id is required')),
  alias: Joi.string()
    .required()
    .max(50)
    .error(new Error('alias should be in a length between 1 to 50 char')),
});

const fetchRoles = () => Joi.object().keys({
  accountId: Joi.string().error(new Error('account id is required')),
  type: Joi.string()
    .required()
    .equal(['all', 'workflow', 'general'])
    .error(
      new Error(
        'type query param can be either all, workflow or general only'
      )
    ),
});

const fetchUsersForRoleId = () => Joi.object().keys({
  accountId: Joi.string().error(new Error('account id is required')),
  roleId: Joi.number().error(new Error('roleId should be a number')),
});

module.exports = {
  validateAlias,
  fetchRoles,
  fetchUsersForRoleId,
};
