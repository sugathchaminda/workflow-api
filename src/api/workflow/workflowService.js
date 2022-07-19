/* eslint-disable prefer-const */
const { parseAccountId } = require('../../utils/parseHelper');
const {
  Workflow,
  WorkflowAlias,
  InviteWorkflowAlias,
  WorkflowRole,
  UserWorkflowRole,
} = require('../../models');

const ApplicationError = require('../../utils/ApplicationError');

/**
 * Enable/Disable workflow module
 * @param {*} attributes
 * @returns {*}
 */
const toggleWorkflow = async (attributes) => {
  const accountId = parseAccountId(attributes.accountId);

  const workflowStatus = await Workflow.getQueryBuilder()
    .where('workflow.supplier', accountId)
    .first()
    .select(['workflow.active']);

  const nextStatus = workflowStatus ? !workflowStatus.active : true;

  if (!workflowStatus) {
    await Workflow.getQueryBuilder().insert({
      supplier: accountId,
      active: nextStatus,
    });
  } else {
    await Workflow.getQueryBuilder().where({ supplier: accountId }).update({
      active: nextStatus,
    });
  }

  return { workflow: nextStatus };
};

/**
 * Check whether the alias is valid
 * @param {*} attributes
 * @returns {Boolean}
 */
const validateAlias = async (attributes) => {
  // parseAccountId
  const accountId = parseAccountId(attributes.accountId);

  // check whether the alias exist in the user alias table and active
  // check whether the alias exist in the invite alias table and invite is valid
  const isAliasUsedByUser = await WorkflowAlias.isAliasUsedForSupplier(
    accountId,
    attributes.alias
  );
  const isAliasUsedByInvite = await InviteWorkflowAlias.isAliasUsedByInvitesForSupplier(
    accountId,
    attributes.alias
  );

  return !(isAliasUsedByUser || isAliasUsedByInvite);
};

/**
 * fetch roles of supplier based on type query parameter
 * @param {*} attributes
 * @returns {Boolean}
 */
const fetchRoles = async (attributes) => {
  // parseAccountId
  const accountId = parseAccountId(attributes.accountId);
  const response = await WorkflowRole.fetchRolesForSupplier(
    accountId,
    attributes.type
  );

  // group roles
  const allRoles = response.reduce((acc, role) => {
    let { type, ...rest } = role;

    // no need of parent field for the general roles
    if (type === 'general') {
      delete rest.parent;
    }

    rest = {
      ...rest,
      // converting the string members count to integer
      members: parseInt(rest.members, 10),
    };

    if (acc[type]) {
      acc[type].push(rest);
    } else {
      acc[type] = [rest];
    }

    return acc;
  }, {});

  const workflowRolesHierarchy = await WorkflowRole.fetchWorkflowHierarchy(
    accountId
  );

  // response construction
  let result;
  if (attributes.type === 'all') {
    result = {
      roles: {
        workflow: workflowRolesHierarchy,
        general: allRoles.general,
      },
    };
  } else if (attributes.type === 'workflow') {
    result = {
      roles: workflowRolesHierarchy,
    };
  } else if (attributes.type === 'general') {
    result = {
      roles: allRoles.general,
    };
  } else {
    throw new ApplicationError({
      message: 'Un known role type',
      statusCode: 400,
    });
  }

  return result;
};

const fetchUsersForRoleId = async (attributes) => {
  // parseAccountId
  const accountId = parseAccountId(attributes.accountId);
  const roleId = parseInt(attributes.roleId, 10);
  const isSupplierHasPermissionForRole = await WorkflowRole.isValidRoleIdForSupplier(
    accountId,
    roleId
  );
  if (!isSupplierHasPermissionForRole) {
    throw new ApplicationError({
      message: 'Role does not belong to the supplier',
      statusCode: 403,
    });
  }

  // Account ID is passed to check whether role exist for supplier condition
  const resposne = await UserWorkflowRole.fetchUsersForRoleId(roleId);
  return resposne;
};

const findWorkflowRoleInHierarchy = (hierarchy, workflowId) => {
  const { id, subroles } = hierarchy;
  let foundNode = null;
  if (Number(id) === workflowId) {
    foundNode = hierarchy;
  }
  subroles.forEach((subrole) => {
    const found = findWorkflowRoleInHierarchy(subrole, workflowId);
    if (found) {
      foundNode = found;
    }
  });
  return foundNode;
};

const checkUserIsBelowAnotherUser = async (attributes) => {
  const accountId = parseAccountId(attributes.accountId);
  const { topUser } = attributes;
  const { belowUser } = attributes;

  const topUserWorkflowRole = await UserWorkflowRole.fetchUserWorkflowRole(
    accountId,
    topUser
  );

  if (!topUserWorkflowRole || !topUserWorkflowRole[0].workflow_role) {
    return false;
  }

  const belowUserWorkflowRole = await UserWorkflowRole.fetchUserWorkflowRole(
    accountId,
    belowUser
  );

  if (
    belowUserWorkflowRole.length === 0
    || !belowUserWorkflowRole[0].workflow_role
  ) {
    return false;
  }

  if (
    topUserWorkflowRole[0].workflow_role
    === belowUserWorkflowRole[0].workflow_role
  ) {
    return false;
  }

  const workflowRolesHierarchy = await WorkflowRole.fetchWorkflowHierarchy(
    accountId
  );

  // getting workflow role object of the 'topUser' from the workflow hierarchy
  const topUserWorkflowRoleObj = findWorkflowRoleInHierarchy(
    workflowRolesHierarchy,
    topUserWorkflowRole[0].workflow_role
  );

  // getting workflow role object of the 'belowUser' from the workflow role object of the 'topUser'
  const belowUserWorkflowRoleObj = findWorkflowRoleInHierarchy(
    topUserWorkflowRoleObj,
    belowUserWorkflowRole[0].workflow_role
  );

  // if 'belowUserWorkflowRoleObj' is not empty, that means the workflow role of 'belowUser' exists as a subrole of 'topUser',
  // thus, 'belowUser' is in a level below of 'topUser'
  if (belowUserWorkflowRoleObj) {
    return true;
  }
  return false;
};

module.exports = {
  toggleWorkflow,
  validateAlias,
  fetchRoles,
  fetchUsersForRoleId,
  checkUserIsBelowAnotherUser,
};
