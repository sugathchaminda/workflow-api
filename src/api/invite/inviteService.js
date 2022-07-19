/* eslint-disable no-console */
/* eslint-disable max-len */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const knex = require('../../db');

const {
  Invite,
  WorkflowRole,
  InviteWorkflowRole,
  UserWorkflowRole,
  UserWorkflowAlias,
  InviteWorkflowAlias,
  WorkflowRoleType,
  WorkflowAlias,
} = require('../../models/index');
const ApplicationError = require('../../utils/ApplicationError');
const { parseAccountId } = require('../../utils/parseHelper');

const addInviteWorkflowAndAlias = async (attributes) => {
  let roleRecords = []; // will hold all the roles for final insert

  const { accountId, inviteId, workflow } = attributes;

  // Save Invite Roles

  // check whether the invite of the supplier is existing and valid
  const supplierId = parseAccountId(accountId);
  const isInviteValid = await Invite.isValidInviteForSupplier(
    inviteId,
    supplierId
  );
  if (!isInviteValid) {
    throw new ApplicationError({
      message: 'Invite is not valid',
      statusCode: 400,
    });
  }

  const { generalRole, workflowRole, workflowAlias } = workflow;

  // check whether the supplier has the roles and the role are active
  // General Role
  if (generalRole && generalRole.length > 0) {
    // return role ids which are in the request body, active, general type and belongs to the supplier in request param
    const validGeneralRoles = await WorkflowRole.filterPermissionedRolesIds(
      generalRole,
      supplierId,
      WorkflowRoleType.ROLE_TYPES.general
    );

    // If the valid general roles are not same as the general role param in the request
    // then the request has invalid roles
    if (generalRole.length !== validGeneralRoles.length) {
      throw new ApplicationError({
        message: 'Invite has invalid roles',
        statusCode: 400,
      });
    }

    const data = validGeneralRoles.map((role) => ({
      invite: inviteId,
      workflow_role: role.id,
    }));
    roleRecords = [...data];
  }

  // Workflow Role
  // check whether the workflowrole exist for the supplier
  if (workflowRole) {
    const validWfRole = await WorkflowRole.filterPermissionedRolesIds(
      [workflowRole],
      supplierId,
      WorkflowRoleType.ROLE_TYPES.workflow
    );
    if (validWfRole.length < 1) {
      throw new ApplicationError({
        message: 'Invite has invalid roles',
        statusCode: 400,
      });
    }

    const roleId = validWfRole[0].id;

    // sign level check - if this role is parent of any other role then this should be a signlevel role
    const isParentRole = await WorkflowRole.isParentRole(accountId, roleId);

    // check whether the workflow role is a signlevel role and the role already have a user in it.
    const userCountOfRole = await UserWorkflowRole.getUserCountByRoleIds([
      roleId,
    ]); // returning an array of object with count

    // check whether there is a invite with similar role
    const inviteCountOfRole = await InviteWorkflowRole.getUserCountByRoleIds([
      roleId,
    ]); // returning an object with count

    if (isParentRole && (userCountOfRole.length > 0 || inviteCountOfRole)) {
      throw new ApplicationError({
        message:
          'You are trying to add a invite to a workflow role which is a signlevel role and has a user',
        statusCode: 400,
      });
    }

    roleRecords = [...roleRecords, { invite: inviteId, workflow_role: roleId }];
  }

  // Save Invite Alias

  // check whether the aliases already exist in the workflow_alias for the supplier
  // check whether any existing users of the supplier have the this alias set and active
  const activeAliasesOfSupplier = await UserWorkflowAlias.fetchActiveAliasesOfSupplier(
    accountId
  );

  // check whether valid invite have this alias set
  const inviteAliasForSupplier = await InviteWorkflowAlias.fetchValidInviteAliasesOfSupplier(
    accountId,
    workflowAlias
  );

  // check whether alias is used for either user or invite
  const isExistingAliasInRequest = workflowAlias.filter(
    (alias) => activeAliasesOfSupplier.indexOf(alias) !== -1
      || inviteAliasForSupplier.indexOf(alias) !== -1
  );

  if (isExistingAliasInRequest.length > 0) {
    throw new ApplicationError({
      message: 'Alias already used',
      statusCode: 409,
    });
  }

  // Final Insert of Roles and Aliases
  const roles = await InviteWorkflowRole.create(roleRecords);
  const workflowRecord = workflowRole ? roles.splice(roles.length - 1) : null; // if the workflow is true, last record is workflow role record

  const aliasRecords = workflowAlias.map((alias) => ({
    invite: inviteId,
    alias,
  }));

  const aliasResponse = await InviteWorkflowAlias.create(aliasRecords);
  let inviteAliases = [];
  if (Array.isArray(aliasResponse)) {
    inviteAliases = aliasResponse.map((response) => response.alias);
  }

  return {
    roles: {
      workflow: workflowRecord,
      general: roles,
    },
    alias: inviteAliases,
  };
};

const fetchInviteWorkflowInfo = async (attributes) => {
  // fetch roles
  const roles = await InviteWorkflowRole.getInviteRoles(attributes.inviteIds);

  // fetch aliases
  const aliases = await InviteWorkflowAlias.getInviteAlias(
    attributes.inviteIds
  );

  const response = attributes.inviteIds.reduce(
    (resultObj, inviteId) => ({
      ...resultObj,
      [inviteId]: {
        workflow_role:
          roles
            .filter(
              (role) => role.invite === inviteId && role.type === 'workflow'
            )
            .map((role) => ({
              id: role.id,
              name: role.name,
              roleId: role.workflow_role,
            }))[0] || {},
        general_roles: roles
          .filter((role) => role.invite === inviteId && role.type === 'general')
          .map((role) => ({
            id: role.id,
            name: role.name,
            roleId: role.workflow_role,
          })),
        invite_aliases: aliases
          .filter((alias) => alias.invite === inviteId)
          .map((role) => ({ id: role.id, text: role.alias })),
      },
    }),
    {}
  );

  return response;
};

const deleteInviteWorkflowInfo = async (attributes) => {
  const accountId = parseAccountId(attributes.accountId);
  const inviteId = parseInt(attributes.inviteId, 10);

  const isInviteValid = await Invite.isValidInviteForSupplier(
    inviteId,
    accountId
  );
  if (!isInviteValid) {
    throw new ApplicationError({
      message: 'Invite is not valid',
      statusCode: 400,
    });
  }

  try {
    // Delete the workflow roles for the invite
    await InviteWorkflowRole.removeByInviteId(inviteId);

    // Delete the workflow alias for the role
    await InviteWorkflowAlias.removeByInviteId(inviteId);
  } catch (error) {
    console.log('Error while deleting invite workflow information: ', error);
    throw new ApplicationError({
      message: 'Error while deleting invite workflow information',
      statusCode: 500,
    });
  }

  return {
    message: 'Successfully Deleted',
  };
};

const addWorkflowInfoForAcceptedUser = async (attributes) => {
  const accountId = parseAccountId(attributes.accountId);
  const { inviteId, userId } = attributes;

  // transaction is used since, there are number of inserts and deletes which will happen
  const transaction = await knex.transaction();
  try {
    /* move the invite workflow roles to user workflow roles */
    const workflowRoles = await InviteWorkflowRole.fetchWorkflowRolesByInviteId(
      inviteId
    );

    // fetch the workflow roles for the invite
    const userWorkflowRoleRecords = workflowRoles.map((role) => ({
      user: userId,
      workflow_role: role,
      active: true,
    }));

    /* move the invite workflow alias to user workflow alias */

    // fetch the invite aliases for a invite
    const inviteWorkflowAliasTexts = await InviteWorkflowAlias.getInviteAlias([
      inviteId,
    ]);

    const workflowAliasRecords = inviteWorkflowAliasTexts.map(({ alias }) => ({
      supplier: accountId,
      text: alias,
    }));

    // check whether the alias is existing
    // if the alias not exist create alias and get the id
    const workflowAliasIds = await WorkflowAlias.validateAndCreate(
      workflowAliasRecords,
      transaction
    );

    const userWorkflowAliasRecords = workflowAliasIds.map((id) => ({
      user: userId,
      alias: id,
    }));

    // insert records to user role and alias tables
    const insertedUserRolesResponse = await UserWorkflowRole.createOrUpdate(
      userWorkflowRoleRecords,
      transaction
    );
    const insertedUserAliasResponse = await UserWorkflowAlias.createOrUpdate(
      userWorkflowAliasRecords,
      transaction
    );

    // delete the invite workflow info
    await InviteWorkflowRole.removeByInviteId(inviteId, transaction);
    await InviteWorkflowAlias.removeByInviteId(inviteId, transaction);

    await transaction.commit();

    return {
      insertedUserRolesResponse,
      insertedUserAliasResponse,
    };
  } catch (error) {
    console.log('addWorkflowInfoForAcceptedUser has failed: ', error);
    await transaction.rollback();
    throw new ApplicationError({
      message: error.message,
      statusCode: 500,
    });
  }
};

module.exports = {
  addInviteWorkflowAndAlias,
  fetchInviteWorkflowInfo,
  deleteInviteWorkflowInfo,
  addWorkflowInfoForAcceptedUser,
};
