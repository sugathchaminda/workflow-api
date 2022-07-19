const { clean, validate } = require('../../utils/validationHelper');
const { requireAccountId } = require('../../utils/schemaHelper');
const {
  isRoleAvailable: isRoleAvailableSchema,
  createGeneralRole: createGeneralRoleSchema,
  indexGeneralRole: indexGeneralRoleSchema,
  editGeneralRole: editGeneralRoleSchema,
  deleteGeneralRole: deleteGeneralRoleSchema,
} = require('./generalroleSchema');

const accountIdValidation = (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
  });

  return validate(attributes, requireAccountId);
};

const isRoleAvailableValidation = (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    role: req.query.role,
    id: req.query.id,
  });

  return validate(attributes, isRoleAvailableSchema);
};

const createGeneralRoleValidation = (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    role: req.body.role,
    permissions: req.body.permissions || [],
  });

  return validate(attributes, createGeneralRoleSchema);
};

const indexGeneralRolesValidation = (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    page: req.query.page || 1,
  });

  return validate(attributes, indexGeneralRoleSchema);
};

const editGeneralRoleValidation = (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    role: req.body.role,
    roleId: req.params.roleId,
    permissions: req.body.permissions,
  });

  return validate(attributes, editGeneralRoleSchema);
};

const deleteGeneralRoleValidation = (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    roleId: req.params.roleId,
  });

  return validate(attributes, deleteGeneralRoleSchema);
};

module.exports = {
  accountIdValidation,
  isRoleAvailableValidation,
  createGeneralRoleValidation,
  indexGeneralRolesValidation,
  editGeneralRoleValidation,
  deleteGeneralRoleValidation,
};
