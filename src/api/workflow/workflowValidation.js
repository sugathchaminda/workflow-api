const { clean, validate } = require('../../utils/validationHelper');
const { requireAccountId } = require('../../utils/schemaHelper');
const schema = require('./workflowSchema');

const accountIdValidation = (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
  });

  return validate(attributes, requireAccountId);
};

const validateAlias = (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    alias: req.query.alias,
  });

  return validate(attributes, schema.validateAlias);
};

const fetchRoles = (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    type: req.query.type,
  });

  return validate(attributes, schema.fetchRoles);
};

const fetchUsersForRoleId = (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    roleId: req.params.roleId,
  });

  return validate(attributes, schema.fetchUsersForRoleId);
};

module.exports = {
  accountIdValidation,
  validateAlias,
  fetchRoles,
  fetchUsersForRoleId,
};
