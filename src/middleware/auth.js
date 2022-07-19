/* eslint-disable max-len */
const errorHelper = require('../utils/errorHelper');
const { parseAccountId } = require('../utils/parseHelper');
const {
  UserWorkflowRole: UserWorkflowRoleModel,
  WorkflowRoleType: WorkflowRoleTypeModel,
} = require('../models');

module.exports = async (req, res, next) => {
  const userObject = process.env.LAMBDA_STAGE === 'dev'
    ? JSON.parse(req.requestContext.authorizer.user)
    : JSON.parse(req.requestContext.authorizer.lambda.user);
  const user = userObject.id;
  const supplier = parseAccountId(req.params.accountId);

  const usersupplierroles = userObject.supplierroles
    .filter((sr) => sr.supplier === supplier)
    .map(({ role }) => ({ role }));

  if (usersupplierroles.length === 0) {
    return res.status(403).json(
      errorHelper({
        message: 'Authentication failed.',
        statusCode: 403,
      }).payload
    );
  }

  req.user = { id: user, permissions: [] };

  // Check if the user+supplier has association with "Manage Workflow" role'.
  // If there is an association, inject role permissions to req.user object.
  // It's not required user to associate with "Manage Workflow" role. But if they do,
  // they can manage General roles & Wrokflow roles (create,update & delete)

  const manageWorkflowRole = userObject.roles
    .filter((role) => role.name === 'Manage Workflow')
    .map(({ id }) => ({ id }))[0] || {};

  const isUserManageWorkflow = usersupplierroles.find(
    (usersupplierrole) => usersupplierrole.role === manageWorkflowRole.id
  );

  if (isUserManageWorkflow) {
    // Will have the entire permission set the user has than just having workflow permissions
    const supplierPermissions = userObject.permissions.filter(
      (permissionSet) => permissionSet.supplier === supplier
    )[0];

    req.user.permissions = supplierPermissions
      ? supplierPermissions.permissionList
      : [];
  }

  // Check if user associate with general roles or a workflow role & extract respective permissions from those roles.
  // Use can associate with multiple general roles & one workflow role.

  // TODO: replace the workflow related information once the workflow informations (roles and rules) are injected to /users/me in QIP

  const userActiveRoles = await UserWorkflowRoleModel.fetchUserRolesForSupplier(
    supplier,
    [user]
  );

  const workflowRoleType = await WorkflowRoleTypeModel.getRoleType(
    WorkflowRoleTypeModel.ROLE_TYPES.workflow
  );

  const roleIds = [];

  // eslint-disable-next-line no-plusplus
  userActiveRoles.forEach((userActiveRole) => {
    if (userActiveRole.role_type === workflowRoleType.id) {
      req.user.workflowRole = {
        id: userActiveRole.workflow_role,
        parent: userActiveRole.parent,
      };
    }

    roleIds.push(userActiveRole.workflow_role);
  });

  return next();
};
