const userController = require('./api/users/userController');
const workflowController = require('./api/workflow/workflowController');
const generalroleController = require('./api/generalrole/generalroleController');
const inviteController = require('./api/invite/inviteController');
const workflowroleController = require('./api/workflowrole/workflowroleController');
const invoiceController = require('./api/invoice/invoiceController');
const dimensionController = require('./api/dimension/dimensionController');
const accountingController = require('./api/accounting/accountingController');

// Route Specific Middlewares
const middlewares = require('./middleware/index');

module.exports.load = (api) => {
  api.options('/*', (req, res) => {
    // Return CORS headers
    res.cors().send({});
  });

  // user
  api.post(
    '/workflow/:accountId/users/roles',
    ...middlewares.userController.fetchUsersRolesAndAliases,
    userController.fetchUsersRolesAndAliases
  );

  api.put(
    '/workflow/:accountId/users/:userId/roles',
    ...middlewares.userController.updateUsersRolesAndAliases,
    userController.updateUsersRolesAndAliases
  );

  api.put(
    '/workflow/:accountId/users/:userId/deactivate',
    ...middlewares.userController.deleteUsersRolesAndAliases,
    userController.deleteUsersRolesAndAliases
  );

  api.get(
    '/workflow/:accountId/users/:userId/validate_delete',
    ...middlewares.userController.deleteUsersRolesAndAliases,
    userController.validateUserDelete
  );

  // enable/disable workflow module
  api.put(
    '/workflow/:accountId/workflow/toggle',
    ...middlewares.workflowController.toggleWorkflow,
    workflowController.toggleWorkflow
  );

  // alias
  api.get(
    '/workflow/:accountId/alias/validate',
    ...middlewares.workflowController.validateAlias,
    workflowController.validateAlias
  );

  // roles
  api.get(
    '/workflow/:accountId/roles',
    ...middlewares.workflowController.fetchRoles,
    workflowController.fetchRoles
  );

  api.get(
    '/workflow/:accountId/roles/:roleId/users',
    ...middlewares.workflowController.fetchUsersForRoleId,
    workflowController.fetchUsersForRoleId
  );

  // check general role isAvailalbe before create
  api.get(
    '/workflow/:accountId/role/general/check/available',
    ...middlewares.generalroleController.isRoleAvailable,
    generalroleController.isRoleAvailable
  );

  // get general role permissions
  api.get(
    '/workflow/:accountId/role/general/permissions',
    ...middlewares.generalroleController.getRolePermissions,
    generalroleController.getRolePermissions
  );

  // create general roles
  api.post(
    '/workflow/:accountId/role/general/create',
    ...middlewares.generalroleController.createRole,
    generalroleController.createRole
  );

  // edit general roles
  api.put(
    '/workflow/:accountId/role/general/:roleId',
    ...middlewares.generalroleController.editRole,
    generalroleController.editRole
  );

  // delete general roles
  api.delete(
    '/workflow/:accountId/role/general/:roleId',
    ...middlewares.generalroleController.deleteRole,
    generalroleController.deleteRole
  );

  // index general roles
  api.get(
    '/workflow/:accountId/role/general/roles',
    ...middlewares.generalroleController.index,
    generalroleController.index
  );

  // invite
  api.post(
    '/workflow/:accountId/invite',
    ...middlewares.inviteController.addInviteWorkflowAndAlias,
    inviteController.addInviteWorkflowAndAlias
  );

  api.post(
    '/workflow/:accountId/invite/fetch',
    ...middlewares.inviteController.fetchInviteWorkflowInfo,
    inviteController.fetchInviteWorkflowInfo
  );

  api.delete(
    '/workflow/:accountId/invite/:inviteId',
    ...middlewares.inviteController.deleteInviteWorkflowInfo,
    inviteController.deleteInviteWorkflowInfo
  );

  api.post(
    '/workflow/:accountId/invite/accept',
    ...middlewares.inviteController.addWorkflowInfoForAcceptedUser,
    inviteController.addWorkflowInfoForAcceptedUser
  );

  // check workflow role isAvailalbe before create
  api.get(
    '/workflow/:accountId/role/workflow/:parentId/check/available',
    ...middlewares.workflowroleController.isRoleAvailable,
    workflowroleController.isRoleAvailable
  );

  // get workflow role permissions
  api.get(
    '/workflow/:accountId/role/workflow/permissions',
    ...middlewares.workflowroleController.getRolePermissions,
    workflowroleController.getRolePermissions
  );

  // create workflow role
  api.post(
    '/workflow/:accountId/role/workflow/:parentId/create',
    ...middlewares.workflowroleController.createRole,
    workflowroleController.createRole
  );

  // index workflow roles
  api.get(
    '/workflow/:accountId/role/workflow/roles',
    ...middlewares.workflowroleController.index,
    workflowroleController.index
  );

  // edit workflow roles
  api.put(
    '/workflow/:accountId/role/workflow/:roleId',
    ...middlewares.workflowroleController.editRole,
    workflowroleController.editRole
  );

  // validate delete role
  api.get(
    '/workflow/:accountId/role/workflow/:roleId/validate/delete',
    ...middlewares.workflowroleController.deleteRole,
    workflowroleController.validateDeleteRole
  );

  api.delete(
    '/workflow/:accountId/role/workflow/:roleId',
    ...middlewares.workflowroleController.deleteRole,
    workflowroleController.deleteRole
  );

  // invoice workflow
  api.post(
    '/workflow/:accountId/invoice/:invoiceId/assign',
    ...middlewares.invoiceController.assignUser,
    invoiceController.assignUser
  );

  api.get(
    '/workflow/:accountId/invoice/:invoiceId/users',
    ...middlewares.invoiceController.getAssignableUsers,
    invoiceController.getAssignableUsers
  );

  api.post(
    'workflow/:accountId/invoice/:invoiceId/approve',
    ...middlewares.invoiceController.approveInvoice,
    invoiceController.approveInvoice
  );

  api.post(
    'workflow/:accountId/invoice/:invoiceId/hold',
    ...middlewares.invoiceController.holdInvoice,
    invoiceController.holdInvoice
  );

  api.get(
    '/workflow/:accountId/invoices/assigned_to/me',
    ...middlewares.invoiceController.getInvoicesAssignedToMe,
    invoiceController.getInvoicesAssignedToMe
  );

  api.get(
    '/workflow/:accountId/invoice/:invoiceId',
    ...middlewares.invoiceController.getInvoice,
    invoiceController.getInvoice
  );

  api.put(
    '/workflow/:accountId/invoice/:invoiceId/cancel',
    ...middlewares.invoiceController.cancelInvoice,
    invoiceController.cancelInvoice
  );

  api.get(
    '/workflow/:accountId/invoices/unassigned',
    ...middlewares.invoiceController.getUnassignInvoices,
    invoiceController.getUnassignedInvoices
  );

  api.put(
    '/workflow/:accountId/invoices/:invoiceId/reassign/:userId',
    ...middlewares.invoiceController.reassignInvoice,
    invoiceController.reassignInvoice
  );

  api.put(
    '/workflow/:accountId/invoice/:invoiceId/assign_unassigned/:userId',
    ...middlewares.invoiceController.assignUnassignedInvoice,
    invoiceController.assignUnassignedInvoice
  );

  api.put(
    'workflow/:accountId/invoice/:invoiceId/release',
    ...middlewares.invoiceController.releaseInvoice,
    invoiceController.releaseInvoice
  );

  api.put(
    '/workflow/:accountId/invoice/:invoiceId/sign',
    ...middlewares.invoiceController.signInvoice,
    invoiceController.signInvoice
  );

  api.post(
    '/workflow/:accountId/invoice/dimensions',
    ...middlewares.dimensionController.addDimensions,
    dimensionController.addDimensions
  );

  api.put(
    '/workflow/:accountId/invoice/dimensions',
    ...middlewares.dimensionController.updateDimensions,
    dimensionController.updateDimensions
  );

  api.delete(
    '/workflow/:accountId/invoice/:invoiceId/dimensions',
    ...middlewares.dimensionController.deleteDimensions,
    dimensionController.deleteDimensions
  );

  api.get(
    '/workflow/:accountId/invoice/:invoiceId/permissions',
    ...middlewares.invoiceController.getInvoicePermissions,
    invoiceController.getInvoicePermissions
  );

  // accounting
  api.get(
    '/workflow/:accountId/accounting/upload_coa_signed_url',
    ...middlewares.accountingController.getSignedUrlForChartOfAccountsUpload,
    accountingController.getSignedUrlForChartOfAccountsUpload
  );

  api.get(
    '/workflow/:accountId/accounting/landing_page_info',
    ...middlewares.accountingController.getLandingPageInfo,
    accountingController.getLandingPageInfo
  );

  api.get(
    '/workflow/:accountId/accounting/chart_of_accounts/:type',
    ...middlewares.accountingController.getChartOfAccounts,
    accountingController.getChartOfAccounts
  );

  api.post(
    '/workflow/:accountId/accounting/chart_of_accounts/:type',
    ...middlewares.accountingController.saveAccountsDraft,
    accountingController.saveAccountsDraft
  );
  api.get(
    '/workflow/:accountId/accounting/:invoiceId/auto_posting',
    ...middlewares.accountingController.autoPosting,
    accountingController.autPosting
  );

  api.post(
    '/workflow/:accountId/accounting/mappings/:type',
    ...middlewares.accountingController.saveMappings,
    accountingController.saveMappings
  );

  api.get(
    '/workflow/:accountId/accounting/:invoiceId/posting_results',
    ...middlewares.accountingController.getPostingResults,
    accountingController.getPostingResults
  );

  api.get(
    '/workflow/:accountId/accounting/mappings',
    ...middlewares.accountingController.getChartOfAccountMappings,
    accountingController.getChartOfAccountMappings
  );

  api.post(
    '/workflow/:accountId/accounting/mappings/publish',
    ...middlewares.accountingController.publishMappings,
    accountingController.publishMappings
  );
};
