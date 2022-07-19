/* eslint-disable no-console */
/* eslint-disable max-len */
const {
  UserWorkflowRole,
  UserWorkflowAlias,
  UserSupplierRole,
  WorkflowRole,
  WorkflowAlias,
  InvoiceWorkflow,
  InvoiceWorkflowHistory,
  WorkflowRoleType,
} = require('../../models/index');
const ApplicationError = require('../../utils/ApplicationError');
const { parseAccountId } = require('../../utils/parseHelper');
const errorHelper = require('../../utils/errorHelper');
const parseHelper = require('../../utils/parseHelper');
const knex = require('../../db');
const {
  writeTimelineLogs,
  getTimelineEntry,
} = require('../../utils/timelineHelper');
const { enums } = require('../../enums/timelineEnums');

// =============================================================================
// Fetch roles and aliases for user ids
// =============================================================================
const fetchUsersRolesAndAliases = async (attributes) => {
  // convert supplier id to number (since path params are strings)
  const accountId = parseAccountId(attributes.accountId);
  const { userIds } = attributes;

  // ---------------------------------------------------------------------------
  // DB Queries to fetch user roles and alias
  // ---------------------------------------------------------------------------
  // fetch user roles for user ids
  const userRoleRecords = await UserWorkflowRole.fetchUserRolesForSupplier(
    accountId,
    userIds
  );
  // user workflow alias
  const userAliasRecords = await UserWorkflowAlias.fetchUserWorkflowAliasForSupplier(
    accountId,
    userIds
  );

  // ---------------------------------------------------------------------------
  // Construting Response User Object with Roles and Aliases
  // ---------------------------------------------------------------------------
  const userObjects = userIds.map((userId) => {
    // fetch user workflow roles
    const workflowRole = userRoleRecords
      .filter((record) => record.user === userId && record.role_type !== 1) // role_type of 1 === 'general'
      .map((role) => ({
        id: role.id,
        name: role.name,
        roleId: role.workflow_role,
      }));

    // fetch user general roles
    const generalRoles = userRoleRecords
      .filter((record) => record.user === userId && record.role_type === 1)
      .map((role) => ({
        id: role.id,
        name: role.name,
        roleId: role.workflow_role,
      }));

    // fetch user aliases
    const userAliases = userAliasRecords
      .filter((record) => record.user === userId)
      .map((alias) => ({
        id: alias.id,
        text: alias.text,
      }));

    return {
      userId,
      workflowRole: workflowRole[0] || {},
      generalRoles,
      userAliases,
    };
  });

  return userObjects;
};

const updateUsersRolesAndAliases = async (attributes) => {
  // convert supplier id to number (since path params are strings)
  const accountId = parseAccountId(attributes.accountId);
  const userId = parseInt(attributes.userId, 10);
  const entryPromises = [];
  const { workflowId } = attributes.supplier;
  const { authUser } = attributes;

  const transaction = await knex.transaction();

  try {
    // Is user exist for supplier
    const isUserExist = await UserSupplierRole.isUserExistForSupplier(
      accountId,
      userId,
      transaction
    );

    if (!isUserExist) {
      throw new ApplicationError({
        message: 'User does not exist for the supplier',
        statusCode: 403,
      });
    }

    // Is passed roles are valid
    const allAttributeRoles = attributes.workflowRole
      ? [attributes.workflowRole, ...attributes.generalRole]
      : attributes.generalRole;
    const isAllRolesValid = await WorkflowRole.filterPermissionedRolesIds(
      allAttributeRoles,
      accountId,
      '',
      transaction
    );

    if (allAttributeRoles.length !== isAllRolesValid.length) {
      throw new ApplicationError({
        message: 'Roles are not valid',
        statusCode: 400,
      });
    }

    // fetch the existing roles and aliases for users
    const existingUserRoles = await UserWorkflowRole.getQueryBuilder()
      .transacting(transaction)
      .leftJoin(
        'workflow_role as workflow_role',
        'workflow_role.id',
        'user_workflow_role.workflow_role'
      )
      .leftJoin(
        'workflow_role_type',
        'workflow_role_type.id',
        'workflow_role.role_type'
      )
      .where('workflow_role.supplier', accountId)
      .where('user_workflow_role.user', userId)
      .where('user_workflow_role.active', true);

    // all role ids workflow and general
    // replace with loop
    let existingWorkflowRole;
    const existingUserRoleIds = [];

    existingUserRoles.forEach((role) => {
      existingUserRoleIds.push(role.workflow_role);
      if (role.type === WorkflowRoleType.ROLE_TYPES.workflow) {
        existingWorkflowRole = role;
      }
    });

    // check if workflow role has been changed to reassign invoices
    if (
      existingWorkflowRole
      && existingWorkflowRole.workflow_role !== attributes.workflowRole
    ) {
      // get invoices assigned to the user
      const statuses = [
        InvoiceWorkflow.STATUS.TO_APPROVE,
        InvoiceWorkflow.STATUS.TO_SIGN,
      ];

      const invoices = await InvoiceWorkflow.getAssignedInvoicesByUserIDAndStatus(
        userId,
        accountId,
        statuses,
        transaction
      );
      // if there are assigned invoices to the user
      if (invoices.length > 0) {
        // seperate to sign and to assign invoices
        const toApproveInvoices = [];
        const toSignInvoices = [];

        invoices.forEach((invoice) => {
          if (invoice.status === InvoiceWorkflow.STATUS.TO_APPROVE) {
            toApproveInvoices.push(invoice.invoice);
          } else {
            toSignInvoices.push(invoice.invoice);
          }
        });

        if (attributes.workflowRole) {
          // if the user's workflow role has been changed
          if (toApproveInvoices.length > 0) {
            await InvoiceWorkflow.getQueryBuilder()
              .transacting(transaction)
              .whereIn('invoice_workflow.invoice', toApproveInvoices)
              .update({
                workflow_role: attributes.workflowRole,
              });
          }

          if (toSignInvoices.length > 0) {
            // if the user's workflow role gets changed, the 'ToSign' invoices assigned to the user gets removed from the user
            // invoice's status and other info doesn't change
            await InvoiceWorkflow.getQueryBuilder()
              .transacting(transaction)
              .whereIn('invoice_workflow.invoice', toSignInvoices)
              .update({
                assigned_to: null,
              });

            // write to workflow history
            await Promise.all(
              toSignInvoices.map((invoiceId) => InvoiceWorkflowHistory.create(
                workflowId,
                invoiceId,
                authUser,
                InvoiceWorkflow.STATUS.TO_SIGN,
                InvoiceWorkflow.STATUS.TO_SIGN,
                userId,
                null,
                InvoiceWorkflowHistory.TYPE.INVOICE_REASSIGNED,
                transaction
              ))
            );

            // write to invoice timeline
            toSignInvoices.forEach((invoiceId) => {
              const timelineAttributes = {
                status: InvoiceWorkflow.STATUS.TO_SIGN,
                userId: authUser,
                toUser: null,
              };

              const timelineEntry = getTimelineEntry(
                timelineAttributes,
                enums.TIMELINE_INCOMINGINVOICE_UNASSIGNED,
                invoiceId
              );
              entryPromises.push(timelineEntry);
            });
          }
        } else {
          // if the user's workflow role has been deleted
          if (toApproveInvoices.length > 0) {
            // if the user's workflow role gets removed from the user, the 'ToApprove' invoices assigned to the user gets removed from the user
            // invoice's status becomes 'ToAssign' and invoice's workflow_role also gets removed
            await InvoiceWorkflow.getQueryBuilder()
              .whereIn('invoice_workflow.invoice', toApproveInvoices)
              .transacting(transaction)
              .update({
                status: InvoiceWorkflow.STATUS.TO_ASSIGN,
                workflow_role: null,
                assigned_to: null,
              });

            // write to workflow history
            await Promise.all(
              toApproveInvoices.map((invoiceId) => InvoiceWorkflowHistory.create(
                workflowId,
                invoiceId,
                authUser,
                InvoiceWorkflow.STATUS.TO_APPROVE,
                InvoiceWorkflow.STATUS.TO_ASSIGN,
                userId,
                null,
                InvoiceWorkflowHistory.TYPE.STATUS_CHANGED,
                transaction
              ))
            );

            // write to invoice timeline
            toApproveInvoices.forEach((invoiceId) => {
              const timelineAttributes = {
                status: InvoiceWorkflow.STATUS.TO_ASSIGN,
                userId: authUser,
                toUser: null,
              };
              const timelineEntry = getTimelineEntry(
                timelineAttributes,
                enums.TIMELINE_INCOMINGINVOICE_WF_STATUS_CHANGED,
                invoiceId
              );
              entryPromises.push(timelineEntry);
            });
          }

          if (toSignInvoices.length > 0) {
            // if the user's workflow role gets removed, the 'ToSign' invoices assigned to the user gets removed from the user
            // invoice' status and other info doesn't change
            await InvoiceWorkflow.getQueryBuilder()
              .whereIn('invoice_workflow.invoice', toSignInvoices)
              .transacting(transaction)
              .update({
                assigned_to: null,
              });

            // write to workflow history
            await Promise.all(
              toSignInvoices.map((invoiceId) => InvoiceWorkflowHistory.create(
                workflowId,
                invoiceId,
                authUser,
                InvoiceWorkflow.STATUS.TO_SIGN,
                InvoiceWorkflow.STATUS.TO_SIGN,
                userId,
                null,
                InvoiceWorkflowHistory.TYPE.INVOICE_REASSIGNED,
                transaction
              ))
            );

            // write to invoice timeline
            toSignInvoices.forEach((invoiceId) => {
              const timelineAttributes = {
                status: InvoiceWorkflow.STATUS.TO_SIGN,
                userId: authUser,
                toUser: null,
              };
              const timelineEntry = getTimelineEntry(
                timelineAttributes,
                enums.TIMELINE_INCOMINGINVOICE_UNASSIGNED,
                invoiceId
              );
              entryPromises.push(timelineEntry);
            });
          }
        }
      }
    }

    const existingUserAlias = await UserWorkflowAlias.getQueryBuilder()
      .transacting(transaction)
      .leftJoin(
        'workflow_alias as workflow_alias',
        'workflow_alias.id',
        'user_workflow_alias.alias'
      )
      .where('workflow_alias.supplier', accountId)
      .where('user_workflow_alias.user', userId)
      .where('user_workflow_alias.active', true)
      .select(
        'user_workflow_alias.*',
        'workflow_alias.text',
        'workflow_alias.id as workflow_id'
      );

    const existingAliasTexts = existingUserAlias.map((alias) => alias.text.toLowerCase());

    // roles to insert
    const rolesToInsert = allAttributeRoles.filter(
      (roleId) => existingUserRoleIds.indexOf(roleId) === -1
    );

    // roles to delete (deactivate)
    const rolesToDelete = existingUserRoleIds.filter(
      (roleId) => allAttributeRoles.indexOf(roleId) === -1
    );

    // aliases to insert
    const aliasToInsert = attributes.workflowAlias.filter(
      (alias) => existingAliasTexts.indexOf(alias.toLowerCase()) === -1
    );

    // aliases to delete (desactivate)
    const lowerCaseAttributeAliases = attributes.workflowAlias.map((alias) => alias.toLowerCase());
    const aliasToDelete = existingAliasTexts.filter(
      (alias) => lowerCaseAttributeAliases.indexOf(alias.toLowerCase()) === -1
    );

    // {text: id}
    const aliasTextToId = existingUserAlias.reduce(
      (aliasmap, alias) => ({
        ...aliasmap,
        [alias.text.toLowerCase()]: alias.id,
      }),
      {}
    );

    // alias id to delete in the user_workflow_alias table
    const deleteUserAliasIds = aliasToDelete.map(
      (alias) => aliasTextToId[alias]
    );

    // Roles DB Operations
    // Insert records to user_workflow_role table
    // Workflow Role Record Construction
    if (rolesToInsert.indexOf(attributes.workflowRole) !== -1) {
      // Is a non insertable sign level role
      if (attributes.workflowRole) {
        const isInsertableWorkflowRole = await WorkflowRole.isInsertableRole(
          accountId,
          attributes.workflowRole,
          transaction
        );
        if (!isInsertableWorkflowRole) {
          throw new ApplicationError({
            message:
              'The workflow role is a signlevel role which already has a member',
            statusCode: 403,
          });
        }
      }
    }

    const modifiedRoles = {};

    // Insert or Updated roles in user_workflow_role table
    if (rolesToInsert.length > 0) {
      const roleRecords = rolesToInsert.map((role) => ({
        user: userId,
        workflow_role: role,
      }));
      modifiedRoles.inserted = await UserWorkflowRole.createOrUpdate(
        roleRecords,
        transaction
      );

      // for the below logics to happen, the user who is getting modified has to get a workflow role inserted
      // the workflow role which the user is getting shouldn't be a role the user is already having
      if (
        attributes.workflowRole
        && attributes.workflowRole !== null
        && existingUserRoleIds.indexOf(attributes.workflowRole) === -1
      ) {
        // get invoiceWorkflowIds that are unassigned, and were assigned to this user before
        let unassignedInvoicesPreviouslyAssignedToTheUser = [];
        try {
          unassignedInvoicesPreviouslyAssignedToTheUser = await InvoiceWorkflow.getUnassignedInvoicesPreviouslyAssignedToTheUser(
            accountId,
            userId
          );
        } catch (error) {
          console.log(
            'Failed to get unassigned invoices previously assigned to the user: ',
            error
          );
        }

        if (unassignedInvoicesPreviouslyAssignedToTheUser.length > 0) {
          // get unique invoice ids
          const uniqueUnassignedInvoiceIds = [
            ...new Set(
              unassignedInvoicesPreviouslyAssignedToTheUser.filter(
                (id) => id !== undefined && id !== null
              )
            ),
          ];

          // after creating userworkflowrole records, if there are any 'ToAssign' invoices which were assigned to this user before,
          // assign those ToAssign invoices to this user
          try {
            await InvoiceWorkflow.updateInvoiceUserStatusAndWFRole(
              uniqueUnassignedInvoiceIds,
              InvoiceWorkflow.STATUS.TO_APPROVE,
              userId,
              attributes.workflowRole,
              transaction
            );
          } catch (error) {
            console.log(
              'error occurred in updateInvoiceUserStatusAndWFRole: ',
              error
            );
            throw new ApplicationError({
              message: ('Failed to update invoices: ', error),
              statusCode: 500,
            });
          }

          // write to workflow history
          await Promise.all(
            uniqueUnassignedInvoiceIds.map((invoiceWorkflowId) => InvoiceWorkflowHistory.create(
              workflowId,
              invoiceWorkflowId,
              authUser,
              InvoiceWorkflow.STATUS.TO_ASSIGN,
              InvoiceWorkflow.STATUS.TO_APPROVE,
              null,
              userId,
              InvoiceWorkflowHistory.TYPE.STATUS_CHANGED,
              transaction
            ))
          );

          // write to invoice timeline
          const timelineAttributes = {
            status: InvoiceWorkflow.STATUS.TO_APPROVE,
            toUser: userId,
            userId: authUser,
          };

          uniqueUnassignedInvoiceIds.forEach((invoiceWorkflowId) => {
            const timelineEntry = getTimelineEntry(
              timelineAttributes,
              enums.TIMELINE_INCOMINGINVOICE_ASSIGNED,
              invoiceWorkflowId
            );
            entryPromises.push(timelineEntry);
          });
        }

        // get invoiceWorkflowIds that have this workflowRole, ToSign status and not assigned to anyone
        const approvedUnassignedInvoiceIds = await InvoiceWorkflow.getInvoicesByRoleStatusAssignedTo(
          attributes.workflowRole,
          InvoiceWorkflow.STATUS.TO_SIGN,
          null
        );

        if (approvedUnassignedInvoiceIds.length > 0) {
          // after creating userworkflowrole records, if there are any 'ToSign' invoices with this workflowrole and are unassigned,
          // assign the ToSign invoices to this user
          try {
            await InvoiceWorkflow.assignInvoicesToAUser(
              approvedUnassignedInvoiceIds,
              userId,
              transaction
            );
          } catch (error) {
            console.log('error in assignInvoicesToAUser: ', error);
            throw new ApplicationError({
              message: ('Failed to update invoices: ', error),
              statusCode: 500,
            });
          }

          // write to workflow history
          await Promise.all(
            approvedUnassignedInvoiceIds.map((invoiceWorkflowId) => InvoiceWorkflowHistory.create(
              workflowId,
              invoiceWorkflowId,
              authUser,
              InvoiceWorkflow.STATUS.TO_SIGN,
              InvoiceWorkflow.STATUS.TO_SIGN,
              null,
              userId,
              InvoiceWorkflowHistory.TYPE.INVOICE_REASSIGNED,
              transaction
            ))
          );

          // write to invoice timeline
          const timelineAttributes = {
            status: InvoiceWorkflow.STATUS.TO_SIGN,
            toUser: userId,
            userId: authUser,
          };

          approvedUnassignedInvoiceIds.forEach((invoiceWorkflowId) => {
            const timelineEntry = getTimelineEntry(
              timelineAttributes,
              enums.TIMELINE_INCOMINGINVOICE_RE_ASSIGNED,
              invoiceWorkflowId
            );
            entryPromises.push(timelineEntry);
          });
        }
      }
    }

    // deactivate deleted roles in user_workflow_role table
    if (rolesToDelete.length > 0) {
      const removedRecords = rolesToDelete.map((role) => ({
        user: userId,
        workflow_role: role,
      }));
      modifiedRoles.removed = await UserWorkflowRole.remove(
        removedRecords,
        transaction
      );
    }

    // ASSUMPTION: aliases are validated for existance before this request
    // inserting new aliases
    const aliasRecords = aliasToInsert.map((alias) => ({
      supplier: accountId,
      text: alias.toLowerCase(),
    }));
    let newAliasIds = [];
    if (aliasRecords.length > 0) {
      newAliasIds = await WorkflowAlias.validateAndCreate(
        aliasRecords,
        transaction
      );
    }
    // updating (activate)/ add aliases to user_workflow_alias table
    const modifiedAliases = {};
    if (newAliasIds.length > 0) {
      const userAliasRecords = newAliasIds.map((aliasId) => ({
        user: userId,
        alias: aliasId,
      }));
      modifiedAliases.inserted = await UserWorkflowAlias.createOrUpdate(
        userAliasRecords,
        transaction
      );
    }

    // remove (deactivate) existing aliases
    if (deleteUserAliasIds.length > 0) {
      modifiedAliases.removed = await UserWorkflowAlias.remove(
        deleteUserAliasIds,
        transaction
      );
    }
    if (entryPromises.length) {
      const timelineEntries = await Promise.all(entryPromises);
      await writeTimelineLogs(timelineEntries, accountId, attributes);
    }

    await transaction.commit();

    // return updated information

    return {
      roles: modifiedRoles,
      alias: modifiedAliases,
    };
  } catch (e) {
    console.log('Update users roles and aliases failed: ', e);
    await transaction.rollback();

    return errorHelper({
      message: 'Update users roles and aliases failed.',
      statusCode: 500,
    }).payload;
  }
};

const deactivateUser = async (attributes) => {
  // convert supplier id to number (since path params are strings)
  const accountId = parseHelper.parseAccountId(attributes.accountId);
  const userId = parseInt(attributes.userId, 10);

  const transaction = await knex.transaction();
  const entryPromises = [];
  /**
   *  invoices assigned to the user will be unassigned first
   *  then user roles and aliases will be removed
   */
  try {
    // get invoices associated with the user
    const statuses = [
      InvoiceWorkflow.STATUS.TO_APPROVE,
      InvoiceWorkflow.STATUS.TO_SIGN,
    ];

    const invoices = await InvoiceWorkflow.getAssignedInvoicesByUserIDAndStatus(
      userId,
      accountId,
      statuses,
      transaction
    );

    // seperate to sign and to assign invoices
    const toApproveInvoices = [];
    const toSignInvoices = [];

    invoices.forEach((invoice) => {
      if (invoice.status === InvoiceWorkflow.STATUS.TO_APPROVE) {
        toApproveInvoices.push(invoice.invoice);
      } else {
        toSignInvoices.push(invoice.invoice);
      }
    });

    // unassign invoices that are assigned to the user in to approve status

    await InvoiceWorkflow.getQueryBuilder()
      .transacting(transaction)
      .whereIn('invoice_workflow.invoice', toApproveInvoices)
      .update({
        status: InvoiceWorkflow.STATUS.TO_ASSIGN,
        workflow_role: null,
        assigned_to: null,
      });

    toApproveInvoices.forEach((invoiceId) => {
      const timelineAttributes = {
        status: InvoiceWorkflow.STATUS.TO_SIGN,
        userId: attributes.authUser,
      };
      const timelineEntry = getTimelineEntry(
        timelineAttributes,
        enums.TIMELINE_INCOMINGINVOICE_WF_STATUS_CHANGED,
        invoiceId
      );
      entryPromises.push(timelineEntry);
    });

    // unassign invoices from the user which are in to sign status
    await InvoiceWorkflow.getQueryBuilder()
      .transacting(transaction)
      .whereIn('invoice_workflow.invoice', toSignInvoices)
      .update({
        assigned_to: null,
        updatedAt: new Date(),
      });

    toSignInvoices.forEach((invoiceId) => {
      const timelineAttributes = {
        status: InvoiceWorkflow.STATUS.TO_SIGN,
        userId: attributes.authUser,
        toUser: null,
      };
      const timelineEntry = getTimelineEntry(
        timelineAttributes,
        enums.TIMELINE_INCOMINGINVOICE_UNASSIGNED,
        invoiceId
      );
      entryPromises.push(timelineEntry);
    });

    // deactivate roles
    const removedRoles = await UserWorkflowRole.removeUsersRolesForSupplier(
      accountId,
      userId,
      transaction
    );
    const roles = removedRoles.map((rec) => rec.workflow_role);

    // deactivate alias
    const removedAliases = await UserWorkflowAlias.removeUsersAliasForSupplier(
      accountId,
      userId,
      transaction
    );
    const aliases = removedAliases.map((rec) => rec.alias);

    if (entryPromises.length) {
      const timelineEntries = await Promise.all(entryPromises);
      await writeTimelineLogs(timelineEntries, accountId, attributes);
    }

    await transaction.commit();

    return {
      roles,
      aliases,
    };
  } catch (e) {
    console.log('Delete user operation failed: ', e);
    await transaction.rollback();

    return errorHelper({
      message: 'Delete user operation failed.',
      statusCode: 500,
    }).payload;
  }
};

const validateUserDelete = async (attributes) => {
  // convert supplier id to number (since path params are strings)
  const accountId = parseAccountId(attributes.accountId);
  const userId = parseInt(attributes.userId, 10);

  const userWorkflowRole = await UserWorkflowRole.fetchUserWorkflowRole(
    accountId,
    userId
  );

  // check if user exists under supplier

  if (userWorkflowRole.length === 0) {
    return errorHelper({
      message: 'User not found',
      statusCode: 404,
    }).payload;
  }

  // get assigned invoices count
  const userInvoices = await InvoiceWorkflow.getAssignedInvoicesCount(
    accountId,
    userId
  );

  return {
    invoices_count: userInvoices,
  };
};

module.exports = {
  fetchUsersRolesAndAliases,
  updateUsersRolesAndAliases,
  deactivateUser,
  validateUserDelete,
};
