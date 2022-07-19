const requiredWorkflow = require('./checkWorkflowEnabled');
const auth = require('./auth');
const canAct = require('./canAct');
const checkAuthKey = require('./checkAuthKey');
const action = require('./action');

const globalMiddlewares = [auth];

module.exports = {
  globalMiddlewares,

  // common middlewares
  requiredWorkflowEnabled: [...globalMiddlewares, requiredWorkflow],

  // route specific middlewares
  userController: {
    fetchUsersRolesAndAliases: [
      ...globalMiddlewares,
      action('workflow_fetchusersrolesandaliases'),
      requiredWorkflow,
      canAct,
    ],

    updateUsersRolesAndAliases: [
      ...globalMiddlewares,
      action('workflow_updateusersrolesandaliases'),
      requiredWorkflow,
      canAct,
    ],

    deleteUsersRolesAndAliases: [
      ...globalMiddlewares,
      action('workflow_deleteusersrolesandaliases'),
      requiredWorkflow,
      canAct,
    ],
  },

  workflowController: {
    toggleWorkflow: [
      ...globalMiddlewares,
      action('workflow_toggleworkflow'),
      canAct,
    ],

    validateAlias: [
      ...globalMiddlewares,
      action('workflow_validatealias'),
      requiredWorkflow,
      canAct,
    ],

    fetchRoles: [
      ...globalMiddlewares,
      action('workflow_fetchroles'),
      requiredWorkflow,
      canAct,
    ],

    fetchUsersForRoleId: [
      ...globalMiddlewares,
      action('workflow_fetchroleusers'),
      requiredWorkflow,
      canAct,
    ],
  },

  generalroleController: {
    isRoleAvailable: [
      ...globalMiddlewares,
      action('workflow_creategeneralrole'),
      requiredWorkflow,
      canAct,
    ],
    getRolePermissions: [
      ...globalMiddlewares,
      action('workflow_listgeneralrolepermissions'),
      requiredWorkflow,
      canAct,
    ],
    createRole: [
      ...globalMiddlewares,
      action('workflow_creategeneralrole'),
      requiredWorkflow,
      canAct,
    ],
    editRole: [
      ...globalMiddlewares,
      action('workflow_updategeneralrole'),
      requiredWorkflow,
      canAct,
    ],
    deleteRole: [
      ...globalMiddlewares,
      action('workflow_deletegeneralrole'),
      requiredWorkflow,
      canAct,
    ],
    index: [
      ...globalMiddlewares,
      action('workflow_listgeneralroles'),
      requiredWorkflow,
      canAct,
    ],
  },

  inviteController: {
    addInviteWorkflowAndAlias: [
      ...globalMiddlewares,
      action('workflow_addinviteworkflowandalias'),
      requiredWorkflow,
      canAct,
    ],
    fetchInviteWorkflowInfo: [
      ...globalMiddlewares,
      action('workflow_fetchinviteworkflowinfo'),
      requiredWorkflow,
      canAct,
    ],
    deleteInviteWorkflowInfo: [
      ...globalMiddlewares,
      action('workflow_deleteinviteworkflowinfo'),
      requiredWorkflow,
      canAct,
    ],
    addWorkflowInfoForAcceptedUser: [requiredWorkflow, checkAuthKey],
  },

  workflowroleController: {
    isRoleAvailable: [
      ...globalMiddlewares,
      action('workflow_createworkflowrole'),
      requiredWorkflow,
      canAct,
    ],
    getRolePermissions: [
      ...globalMiddlewares,
      action('workflow_listworkflowrolepermissions'),
      requiredWorkflow,
      canAct,
    ],
    createRole: [
      ...globalMiddlewares,
      action('workflow_createworkflowrole'),
      requiredWorkflow,
      canAct,
    ],
    index: [
      ...globalMiddlewares,
      action('workflow_listworkflowroles'),
      requiredWorkflow,
      canAct,
    ],
    editRole: [
      ...globalMiddlewares,
      action('workflow_updateworkflowrole'),
      requiredWorkflow,
      canAct,
    ],
    deleteRole: [
      ...globalMiddlewares,
      action('workflow_deleteworkflowrole'),
      requiredWorkflow,
      canAct,
    ],
  },

  invoiceController: {
    // TODO: should we have to add any permissions for this API
    // This API will be called inside validateAndCreate
    // validateAndCreate will be called either by, ESB Receive Invoice or By API when fixing incomplete invoices
    // Should we add any permissions here?

    assignUser: [requiredWorkflow, checkAuthKey],
    approveInvoice: [
      ...globalMiddlewares,
      action('workflow_approve'),
      requiredWorkflow,
      canAct,
    ],
    holdInvoice: [
      ...globalMiddlewares,
      action(['general_hold', 'workflow_hold']),
      requiredWorkflow,
      canAct,
    ],
    getInvoicesAssignedToMe: [
      ...globalMiddlewares,
      action('workflow_approve'), // Having permission to `approve` means role has permission to view invoices associated with it's user.
      requiredWorkflow,
      canAct,
    ],
    // TODO: Need to make this route usable by general user using 'general_view_invoice' permission.
    getInvoice: [
      ...globalMiddlewares,
      action('workflow_view_invoice'),
      requiredWorkflow,
      canAct,
    ],
    cancelInvoice: [
      ...globalMiddlewares,
      action(['general_cancel', 'workflow_cancel']),
      requiredWorkflow,
      canAct,
    ],
    getUnassignInvoices: [
      ...globalMiddlewares,
      action('general_assign'),
      requiredWorkflow,
      canAct,
    ],
    reassignInvoice: [
      ...globalMiddlewares,
      action(['general_reassign', 'workflow_reassign']),
      requiredWorkflow,
      canAct,
    ],
    assignUnassignedInvoice: [
      ...globalMiddlewares,
      action('general_assign'),
      requiredWorkflow,
      canAct,
    ],
    releaseInvoice: [
      ...globalMiddlewares,
      action(['general_hold', 'workflow_hold']), // having permission to 'hold' means role has permission to 'release' invoices as well
      requiredWorkflow,
      canAct,
    ],
    signInvoice: [
      ...globalMiddlewares,
      action('workflow_sign'),
      requiredWorkflow,
      canAct,
    ],
    getInvoicePermissions: [...globalMiddlewares, requiredWorkflow],
    getAssignableUsers: [
      ...globalMiddlewares,
      action(['general_assign', 'workflow_reassign']),
      requiredWorkflow,
      canAct,
    ],
  },

  dimensionController: {
    addDimensions: [
      ...globalMiddlewares,
      action('workflow_adddimensions'),
      requiredWorkflow,
      canAct,
    ],
    updateDimensions: [
      ...globalMiddlewares,
      action('workflow_updatedimensions'),
      requiredWorkflow,
      canAct,
    ],
    deleteDimensions: [
      action(['workflow_deletedimensions']),
      ...globalMiddlewares,
      requiredWorkflow,
      canAct,
    ],
  },

  accountingController: {
    getSignedUrlForChartOfAccountsUpload: [
      action(['workflow_managechartofaccounts']),
      ...globalMiddlewares,
      requiredWorkflow,
      canAct,
    ],
    getChartOfAccounts: [
      action(['workflow_managechartofaccounts']),
      ...globalMiddlewares,
      requiredWorkflow,
      canAct,
    ],
    getLandingPageInfo: [
      action(['workflow_managechartofaccounts']),
      ...globalMiddlewares,
      requiredWorkflow,
      canAct,
    ],
    autoPosting: [requiredWorkflow, checkAuthKey],
    getPostingResults: [
      action(['workflow_managechartofaccounts']),
      ...globalMiddlewares,
      requiredWorkflow,
      canAct,
    ],
    saveAccountsDraft: [
      action(['workflow_managechartofaccounts']),
      ...globalMiddlewares,
      requiredWorkflow,
      canAct,
    ],
    getChartOfAccountMappings: [
      action(['workflow_managechartofaccounts']),
      ...globalMiddlewares,
      requiredWorkflow,
      canAct,
    ],
    saveMappings: [
      action(['workflow_managechartofaccounts']),
      ...globalMiddlewares,
      requiredWorkflow,
      canAct,
    ],
    publishMappings: [
      action(['workflow_managechartofaccounts']),
      ...globalMiddlewares,
      requiredWorkflow,
      canAct,
    ],
  },
};
