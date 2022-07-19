/* eslint-disable no-restricted-globals */
const { clean, validate } = require('../../utils/validationHelper');
const schema = require('./userSchema');
const ApplicationError = require('../../utils/ApplicationError');

const fetchUsersRolesAndAliases = async (req) => {
  // if id query param is not passed
  if (!req.body || !req.body.ids) {
    throw new ApplicationError({
      message:
        "Request validation error: request body doesn't have ids parameters",
      statusCode: 422,
    });
  }

  const attributes = clean({
    accountId: req.params.accountId,
    userIds: req.body.ids,
  });

  return validate(attributes, schema.fetchUsersRolesAndAliases);
};

const updateUsersRolesAndAliases = async (req) => {
  // if ids param is not passed
  if (!req.body) {
    throw new ApplicationError({
      message:
        "Request validation error: request body doesn't have required parameters",
      statusCode: 422,
    });
  }

  const attributes = clean({
    accountId: req.params.accountId,
    userId: req.params.userId,
    workflowRole: req.body.workflowRole,
    generalRole: req.body.generalRole,
    workflowAlias: req.body.workflowAlias,
    authUser: req.user.id,
    cookie: req.headers.cookie,
    supplier: req.supplier,
  });

  return validate(attributes, schema.updateUsersRolesAndAliases);
};

const deleteUsersRolesAndAliases = async (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    userId: req.params.userId,
    authUser: req.user.id,
    cookie: req.headers.cookie,
  });

  return validate(attributes, schema.deleteUsersRolesAndAliases);
};

module.exports = {
  fetchUsersRolesAndAliases,
  updateUsersRolesAndAliases,
  deleteUsersRolesAndAliases,
};
