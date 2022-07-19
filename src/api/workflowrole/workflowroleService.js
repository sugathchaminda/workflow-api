/* eslint-disable no-console */
const knex = require('../../db');
const {
  WorkflowRole: WorkflowRoleModel,
  WorkflowRoleType: WorkflowRoleTypeModel,
  WorkflowRule: WorkflowRuleModel,
  WorkflowRuleCondition: WorkflowRuleConditionModel,
  UserWorkflowRole: UserWorkflowRoleModel,
  InvoiceWorkflow: InvoiceWorkflowModel,
  InvoiceWorkflowHistory: InvoiceWorkflowHistoryModel,
} = require('../../models');

const { parseAccountId } = require('../../utils/parseHelper');
const errorHelper = require('../../utils/errorHelper');
const {
  getTimelineEntry,
  writeTimelineLogs,
} = require('../../utils/timelineHelper');
const { enums } = require('../../enums/timelineEnums');

const isRoleAvailable = async (attributes) => {
  const accountId = parseAccountId(attributes.accountId);
  const parentId = parseInt(attributes.parentId, 10);
  const role = attributes.role.trim();

  // parentId = 0 means, request is referencing to the top-level role of the supplier's workflow hierarchy.
  // There can be only 1 top level role for a workflow hierarchy. The role name doesn't matter in this context.
  if (parentId === 0) {
    const topLevelRole = await WorkflowRoleModel.getTopLevelRole(
      accountId,
      true
    );

    if (topLevelRole) {
      return errorHelper({
        message: 'Top level role already exist.',
        statusCode: 409,
      }).payload;
    }
  } else {
    const parentRole = await WorkflowRoleModel.getRole(
      accountId,
      WorkflowRoleTypeModel.ROLE_TYPES.workflow,
      { roleId: parentId, active: true }
    );

    // If the parent not found, can't create the new role under that parent.
    if (!parentRole) {
      return errorHelper({
        message: 'Invalid parent id.',
        statusCode: 422,
      }).payload;
    }

    const isRoleExist = await WorkflowRoleModel.isRoleExist(
      accountId,
      WorkflowRoleTypeModel.ROLE_TYPES.workflow,
      role,
      parentId,
      true
    );

    // If new role exist under given parent, can't create the new role under that parent.
    if (isRoleExist) {
      return errorHelper({
        message: 'Role already exist.',
        statusCode: 409,
      }).payload;
    }
  }

  return {
    message: 'Role is available.',
    statusCode: 200,
  };
};

const getRolePermissions = async () => {
  const permissions = await WorkflowRuleModel.getQueryBuilder()
    .where('workflow_rule.rule_type', WorkflowRoleTypeModel.ROLE_TYPES.workflow)
    .whereNotNull('display_name')
    .select(['workflow_rule.display_name']);

  return permissions.map((permission) => ({
    permission: permission.display_name,
  }));
};

const createRole = async (attributes) => {
  const accountId = parseAccountId(attributes.accountId);
  const parentId = parseInt(attributes.parentId, 10);
  const role = attributes.role.trim();

  // Check if the parendId = 0, which means trying to create a top level role.
  // If there is a toplevel role in active status return an error.
  // If there is a toplevel role in deactivated status reactivate it & populate role rules.
  // If there is no toplevel role create a role & populate role rules.
  if (parentId === 0) {
    const topLevelRole = await WorkflowRoleModel.getTopLevelRole(accountId);

    if (topLevelRole) {
      if (topLevelRole.active) {
        return errorHelper({
          message: 'Top level role already exist.',
          statusCode: 409,
        }).payload;
      }

      const evaluatedSpendingLimit = WorkflowRuleConditionModel.evalSpendingLimit(
        null
      ); // Top-Level role doesn't have a spending limit.

      await WorkflowRoleModel.createOrUpdateWorkflowRole(
        accountId,
        {
          name: role,
          active: true,
          sign_role: true,
        },
        {
          roleId: topLevelRole.id,
          conditions: WorkflowRuleConditionModel.getWorkflowRoleConditions({
            spending_limit: evaluatedSpendingLimit,
          }),
        }
      );

      return {
        id: topLevelRole.id,
        name: role,
        spending_limit: evaluatedSpendingLimit,
      };
    }

    const workflowRoleType = await WorkflowRoleTypeModel.getRoleType(
      WorkflowRoleTypeModel.ROLE_TYPES.workflow
    );

    const evaluatedSpendingLimit = WorkflowRuleConditionModel.evalSpendingLimit(
      null
    ); // Top-Level role doesn't have a spending limit.

    const newTopLevelRole = await WorkflowRoleModel.createOrUpdateWorkflowRole(
      accountId,
      {
        name: role,
        role_type: workflowRoleType.id,
        supplier: accountId,
        parent: WorkflowRoleModel.NO_PARENT,
        active: true,
        sign_role: true,
      },
      {
        conditions: WorkflowRuleConditionModel.getWorkflowRoleConditions({
          spending_limit: evaluatedSpendingLimit,
        }),
      }
    );

    return {
      id: newTopLevelRole.id,
      name: role,
      spending_limit: evaluatedSpendingLimit,
    };
  }

  const { spendingLimit } = attributes;

  const parentRole = await WorkflowRoleModel.getRole(
    accountId,
    WorkflowRoleTypeModel.ROLE_TYPES.workflow,
    { roleId: parentId, active: true, count_members: true }
  );

  // If the parent not found, can't create the new role under that parent.
  if (!parentRole) {
    return errorHelper({
      message: 'Invalid parent id.',
      statusCode: 422,
    }).payload;
  }

  if (parentRole.members > 1) {
    return errorHelper({
      message: 'Parent role has multiple users.',
      statusCode: 422,
    }).payload;
  }

  const existingRole = await WorkflowRoleModel.getRole(
    accountId,
    WorkflowRoleTypeModel.ROLE_TYPES.workflow,
    { parentId, roleName: role }
  );

  if (existingRole) {
    // If new role exist under the given parent in an active status, can't create the new role under that parent.
    if (existingRole.active) {
      return errorHelper({
        message: 'Role already exist.',
        statusCode: 409,
      }).payload;
    }

    const evaluatedSpendingLimit = WorkflowRuleConditionModel.evalSpendingLimit(
      spendingLimit
    );

    // Role will be set to 'active: false' upon deletion. Role related role_rules & rule_conditions get deleted.
    // So need to create them again upon re-activation.
    await WorkflowRoleModel.createOrUpdateWorkflowRole(
      accountId,
      {
        active: true,
        sign_role: false,
      },
      {
        roleId: existingRole.id,
        conditions: WorkflowRuleConditionModel.getWorkflowRoleConditions({
          spending_limit: evaluatedSpendingLimit,
        }),
        parent: {
          id: parentId,
          sign_role: parentRole.sign_role,
        },
      }
    );

    return {
      id: existingRole.id,
      name: role,
      spending_limit: evaluatedSpendingLimit,
    };
  }

  const workflowRoleType = await WorkflowRoleTypeModel.getRoleType(
    WorkflowRoleTypeModel.ROLE_TYPES.workflow
  );

  const evaluatedSpendingLimit = WorkflowRuleConditionModel.evalSpendingLimit(
    spendingLimit
  );

  const newWorkflowRole = await WorkflowRoleModel.createOrUpdateWorkflowRole(
    accountId,
    {
      name: role,
      role_type: workflowRoleType.id,
      supplier: accountId,
      parent: parentId,
      active: true,
      sign_role: false,
    },
    {
      conditions: WorkflowRuleConditionModel.getWorkflowRoleConditions({
        spending_limit: evaluatedSpendingLimit,
      }),
      parent: {
        id: parentId,
        sign_role: parentRole.sign_role,
      },
    }
  );

  return {
    id: newWorkflowRole.id,
    name: role,
    spending_limit: evaluatedSpendingLimit,
  };
};

const index = async (attributes) => {
  const accountId = parseAccountId(attributes.accountId);

  const hierarchy = await WorkflowRoleModel.fetchWorkflowHierarchy(accountId);

  return hierarchy || null;
};

const editWorkflowRole = async (attributes) => {
  const accountId = parseAccountId(attributes.accountId);
  const roleId = parseInt(attributes.roleId, 10);
  const role = attributes.role.trim();

  // check if workflow-role exist by id
  const existingRoleWithId = await WorkflowRoleModel.getRole(
    accountId,
    WorkflowRoleTypeModel.ROLE_TYPES.workflow,
    { roleId, active: true }
  );

  if (!existingRoleWithId) {
    return errorHelper({
      message: 'Role not found.',
      statusCode: 404,
    }).payload;
  }

  // check if new role name available
  const existingRoleWithNewRoleName = await WorkflowRoleModel.getRole(
    accountId,
    WorkflowRoleTypeModel.ROLE_TYPES.workflow,
    { roleName: role, active: true, excludingIds: [roleId] }
  );

  if (existingRoleWithNewRoleName) {
    return errorHelper({
      message: 'Role already exist.',
      statusCode: 409,
    }).payload;
  }

  // update if new role name
  if (existingRoleWithId.name !== role) {
    await WorkflowRoleModel.getQueryBuilder()
      .where({ id: roleId })
      .update('name', role);
  }

  const condition = await WorkflowRuleConditionModel.getCondition(
    roleId,
    WorkflowRuleConditionModel.TYPES.spending_limit.constraint
  );

  // Precausion to check if 'spending_limit' rule condition exist before updating.
  // There should be a 'spending_limit' for every workflow role. So logging the error would make it easier for debugging if condition not found.
  if (!condition) {
    throw Error(`spending_limit condition not found for role-id ${roleId}`);
  }

  const { spendingLimit } = attributes;

  const evaluatedSpendingLimit = WorkflowRuleConditionModel.evalSpendingLimit(
    spendingLimit
  );

  // update if new spending_limit
  if (condition.value !== evaluatedSpendingLimit) {
    await WorkflowRuleConditionModel.getQueryBuilder()
      .where({ id: condition.id })
      .update('value', evaluatedSpendingLimit);
  }

  return {
    name: role,
    spending_limt: evaluatedSpendingLimit,
  };
};

const validateDeleteWorkflowRole = async (attributes) => {
  const accountId = parseAccountId(attributes.accountId);
  const roleId = parseInt(attributes.roleId, 10);

  // check if workflow-role exist by id
  const existingRoleWithId = await WorkflowRoleModel.getRole(
    accountId,
    WorkflowRoleTypeModel.ROLE_TYPES.workflow,
    { roleId, active: true }
  );

  if (!existingRoleWithId) {
    return errorHelper({
      message: 'Role not found.',
      statusCode: 404,
    }).payload;
  }

  // check if role is a parent role.
  const isParentRole = await WorkflowRoleModel.isParentRole(accountId, roleId);

  if (isParentRole) {
    return errorHelper({
      message: 'Parent role conflict. Delete associated sub-roles first.',
      statusCode: 409,
    }).payload;
  }

  // Fetch number of users associated with the role.
  const roleUsersCount = await UserWorkflowRoleModel.getUserCountByRoleIds([
    roleId,
  ]);

  return {
    role_users: roleUsersCount[0] ? parseInt(roleUsersCount[0].count, 10) : 0,
  };
};

const deleteRole = async (attributes) => {
  const accountId = parseAccountId(attributes.accountId);
  const roleId = parseInt(attributes.roleId, 10);
  const { workflowId } = attributes.supplier;
  const { authUser } = attributes;

  // check if workflow-role exist by id
  const existingRoleWithId = await WorkflowRoleModel.getRole(
    accountId,
    WorkflowRoleTypeModel.ROLE_TYPES.workflow,
    { roleId, active: true }
  );

  if (!existingRoleWithId) {
    return errorHelper({
      message: 'Role not found.',
      statusCode: 404,
    }).payload;
  }

  // check if role is a parent role.
  const isParentRole = await WorkflowRoleModel.isParentRole(accountId, roleId);

  if (isParentRole) {
    return errorHelper({
      message: 'Parent role conflict. Delete associated sub-roles first.',
      statusCode: 409,
    }).payload;
  }

  // TODO: Update invoice timeline about what happened during 'deleting the workflow-role'.

  // deassociate user with the relevant role (delete user_workflow_role record)
  // move invoices associated with the relevant role to the next status, depending on the current status.
  // IF "ToApprove" to "ToAssign" IF "ToSign" find the next parent & assign to that role. If no parent move to "ToAssign"
  const transaction = await knex.transaction();
  const entryPromises = [];
  try {
    // delete user+role association.
    await UserWorkflowRoleModel.getQueryBuilder()
      .transacting(transaction)
      .where('user_workflow_role.workflow_role', roleId)
      .del();

    const roleInvoices = await InvoiceWorkflowModel.getInvoicesByRole(roleId, [
      InvoiceWorkflowModel.STATUS.TO_APPROVE,
      InvoiceWorkflowModel.STATUS.TO_SIGN,
    ]);

    const toApproveInvoices = [];
    const toApproveInvoicesRecords = [];
    const toSignInvoices = [];
    const toSignInvoicesRecords = [];

    roleInvoices.forEach((roleInvoice) => {
      if (roleInvoice.status === InvoiceWorkflowModel.STATUS.TO_APPROVE) {
        toApproveInvoices.push(roleInvoice.invoice);
        toApproveInvoicesRecords.push(roleInvoice);
      } else {
        toSignInvoices.push(roleInvoice.invoice);
        toSignInvoicesRecords.push(roleInvoice);
      }
    });

    // Change invoices in 'ToApprove' state to 'ToAssign' state.
    if (toApproveInvoices.length > 0) {
      await InvoiceWorkflowModel.getQueryBuilder()
        .transacting(transaction)
        .whereIn('invoice_workflow.invoice', toApproveInvoices)
        .update({
          status: InvoiceWorkflowModel.STATUS.TO_ASSIGN,
          workflow_role: null,
          assigned_to: null,
          updatedAt: new Date(),
        });

      // write to workflow history
      await Promise.all(
        toApproveInvoicesRecords.map((invoiceRecord) => InvoiceWorkflowHistoryModel.create(
          workflowId,
          invoiceRecord.invoice,
          authUser,
          InvoiceWorkflowModel.STATUS.TO_APPROVE,
          InvoiceWorkflowModel.STATUS.TO_ASSIGN,
          invoiceRecord.assigned_to,
          null,
          InvoiceWorkflowHistoryModel.TYPE.STATUS_CHANGED,
          transaction
        ))
      );

      // write to invoice timeline
      toApproveInvoices.forEach((invoiceId) => {
        const timelineAttributes = {
          status: InvoiceWorkflowModel.STATUS.TO_ASSIGN,
          userId: authUser,
        };

        const timelineEntry = getTimelineEntry(
          timelineAttributes,
          enums.TIMELINE_INCOMINGINVOICE_WF_STATUS_CHANGED,
          invoiceId
        );
        entryPromises.push(timelineEntry);
      });
    }

    // Assign invoices in 'ToSign' state to next parent.
    // If no parent move to 'ToAssign' state.
    if (toSignInvoices.length > 0) {
      if (existingRoleWithId.parent === WorkflowRoleModel.NO_PARENT) {
        await InvoiceWorkflowModel.getQueryBuilder()
          .whereIn('invoice_workflow.invoice', toSignInvoices)
          .update({
            status: InvoiceWorkflowModel.STATUS.TO_ASSIGN,
            workflow_role: null,
            assigned_to: null,
            updatedAt: new Date(),
          });

        // write to workflow history
        await Promise.all(
          toSignInvoicesRecords.map((invoiceRecord) => InvoiceWorkflowHistoryModel.create(
            workflowId,
            invoiceRecord.invoice,
            authUser,
            InvoiceWorkflowModel.STATUS.TO_SIGN,
            InvoiceWorkflowModel.STATUS.TO_ASSIGN,
            invoiceRecord.assigned_to,
            null,
            InvoiceWorkflowHistoryModel.TYPE.STATUS_CHANGED,
            transaction
          ))
        );

        // write to invoice timeline
        toSignInvoices.forEach((invoiceId) => {
          const timelineAttributes = {
            status: InvoiceWorkflowModel.STATUS.TO_ASSIGN,
            userId: authUser,
          };
          const timelineEntry = getTimelineEntry(
            timelineAttributes,
            enums.TIMELINE_INCOMINGINVOICE_WF_STATUS_CHANGED,
            invoiceId
          );
          entryPromises.push(timelineEntry);
        });
      } else {
        const parentRoleUser = await UserWorkflowRoleModel.fetchUsersForRoleId(
          existingRoleWithId.parent
        );

        await InvoiceWorkflowModel.getQueryBuilder()
          .transacting(transaction)
          .whereIn('invoice_workflow.invoice', toSignInvoices)
          .update({
            workflow_role: existingRoleWithId.parent,
            assigned_to: parentRoleUser[0] ? parentRoleUser[0].id : null,
            updatedAt: new Date(),
          });

        // write to workflow history
        await Promise.all(
          toSignInvoicesRecords.map((invoiceRecord) => InvoiceWorkflowHistoryModel.create(
            workflowId,
            invoiceRecord.invoice,
            authUser,
            InvoiceWorkflowModel.STATUS.TO_SIGN,
            InvoiceWorkflowModel.STATUS.TO_SIGN,
            invoiceRecord.assigned_to,
            parentRoleUser[0] ? parentRoleUser[0].id : null,
            InvoiceWorkflowHistoryModel.TYPE.INVOICE_REASSIGNED,
            transaction
          ))
        );

        // write to invoice timeline
        toSignInvoices.forEach((invoiceId) => {
          const timelineAttributes = {
            status: InvoiceWorkflowModel.STATUS.TO_SIGN,
            userId: authUser,
            toUser: parentRoleUser[0] ? parentRoleUser[0].id : null,
          };
          const timelineEntry = getTimelineEntry(
            timelineAttributes,
            enums.TIMELINE_INCOMINGINVOICE_RE_ASSIGNED,
            invoiceId
          );
          entryPromises.push(timelineEntry);
        });
      }
    }

    // Delete workflow-role
    await WorkflowRoleModel.deleteWorkflowRole(
      existingRoleWithId,
      accountId,
      transaction
    );

    // If parent role become none parent/sign role, assigned invoices for "signing" needs to move to next parent.
    // This doesn't apply for the top-level role, since it's a sign-role by default.
    if (existingRoleWithId.parent !== WorkflowRoleModel.NO_PARENT) {
      const parentRole = await WorkflowRoleModel.getRole(
        accountId,
        WorkflowRoleTypeModel.ROLE_TYPES.workflow,
        { roleId: existingRoleWithId.parent, active: true }
      );

      const isStillParentRole = await WorkflowRoleModel.isParentRole(
        accountId,
        parentRole.id,
        transaction
      );

      if (!isStillParentRole) {
        if (parentRole.parent !== WorkflowRoleModel.NO_PARENT) {
          await WorkflowRoleModel.getQueryBuilder()
            .transacting(transaction)
            .where('workflow_role.id', parentRole.id)
            .update({ sign_role: false });
        }

        const parentRoleInvoices = await InvoiceWorkflowModel.getInvoicesByRole(
          parentRole.id,
          [InvoiceWorkflowModel.STATUS.TO_SIGN],
          transaction
        );

        const parentRoleToSignInvoices = parentRoleInvoices.map(
          (parentRoleInvoice) => parentRoleInvoice.invoice
        );

        const parentRoleUser = await UserWorkflowRoleModel.fetchUsersForRoleId(
          parentRole.parent
        );

        if (parentRoleToSignInvoices.length > 0) {
          await InvoiceWorkflowModel.getQueryBuilder()
            .transacting(transaction)
            .whereIn('invoice_workflow.invoice', parentRoleToSignInvoices)
            .update({
              workflow_role: parentRole.parent,
              assigned_to: parentRoleUser[0] ? parentRoleUser[0].id : null,
              updatedAt: new Date(),
            });

          // write to workflow history
          await Promise.all(
            parentRoleInvoices.map((parentRoleInvoice) => InvoiceWorkflowHistoryModel.create(
              workflowId,
              parentRoleInvoice.invoice,
              authUser,
              InvoiceWorkflowModel.STATUS.TO_SIGN,
              InvoiceWorkflowModel.STATUS.TO_SIGN,
              parentRoleInvoice.assigned_to,
              parentRoleUser[0] ? parentRoleUser[0].id : null,
              InvoiceWorkflowHistoryModel.TYPE.INVOICE_REASSIGNED,
              transaction
            ))
          );

          // write to invoice timeline
          parentRoleToSignInvoices.forEach((invoiceId) => {
            const timelineAttributes = {
              status: InvoiceWorkflowModel.STATUS.TO_SIGN,
              userId: authUser,
              toUser: parentRoleUser[0] ? parentRoleUser[0].id : null,
            };
            const timelineEntry = getTimelineEntry(
              timelineAttributes,
              enums.TIMELINE_INCOMINGINVOICE_RE_ASSIGNED,
              invoiceId
            );
            entryPromises.push(timelineEntry);
          });
        }
      }
    }
    if (entryPromises.length) {
      const timelineEntries = await Promise.all(entryPromises);
      await writeTimelineLogs(timelineEntries, accountId, attributes);
    }

    await transaction.commit();

    return {
      message: 'Role is deleted.',
      statusCode: 200,
    };
  } catch (error) {
    console.log('Delete role has failed: ', error);
    await transaction.rollback();

    throw error;
  }
};

module.exports = {
  isRoleAvailable,
  getRolePermissions,
  createRole,
  index,
  editWorkflowRole,
  validateDeleteWorkflowRole,
  deleteRole,
};
