const { clean, validate } = require('../../utils/validationHelper');
const { requireAccountId } = require('../../utils/schemaHelper');
const {
  isRoleAvailable: isRoleAvailableSchema,
  createWorkflowRole: createWorkflowRoleSchema,
  editWorkflowRole: editWorkflowRoleSchema,
  deleteWorkflowRole: deleteWorkflowRoleSchema,
} = require('./workflowroleSchema');

const accountIdValidation = (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
  });

  return validate(attributes, requireAccountId);
};

const isRoleAvailableValidation = (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    parentId: req.params.parentId,
    role: req.query.role,
  });

  return validate(attributes, isRoleAvailableSchema);
};

const createWorkflowRoleValidation = (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    parentId: req.params.parentId,
    role: req.body.role,
    spendingLimit: req.body.spending_limit,
  });

  return validate(attributes, createWorkflowRoleSchema);
};

const editWorkflowRoleValidation = (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    roleId: req.params.roleId,
    role: req.body.role,
    spendingLimit: req.body.spending_limit,
  });

  return validate(attributes, editWorkflowRoleSchema);
};

const deleteWorkflowRoleValidation = (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    roleId: req.params.roleId,
    cookie: req.headers.cookie,
    authUser: req.user.id,
    supplier: req.supplier,
  });

  return validate(attributes, deleteWorkflowRoleSchema);
};

module.exports = {
  isRoleAvailableValidation,
  accountIdValidation,
  createWorkflowRoleValidation,
  editWorkflowRoleValidation,
  deleteWorkflowRoleValidation,
};
