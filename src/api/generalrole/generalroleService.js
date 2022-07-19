const {
  WorkflowRole: WorkflowRoleModel,
  WorkflowRule: WorkflowRuleModel,
  WorkflowRoleType: WorkflowRoleTypeModel,
  WorkflowRoleRule: WorkflowRoleRuleModel,
  UserWorkflowRole: UserWorkflowRoleModel,
} = require('../../models');
const { parseAccountId } = require('../../utils/parseHelper');
const errorHelper = require('../../utils/errorHelper');

const isRoleAvailable = async (attributes) => {
  const role = attributes.role.trim();
  const roleId = parseInt(attributes.id, 10);
  const accountId = parseAccountId(attributes.accountId);

  const existingRole = await WorkflowRoleModel.getRole(
    accountId,
    WorkflowRoleTypeModel.ROLE_TYPES.general,
    { roleName: role }
  );

  if (existingRole) {
    if (!roleId || roleId !== existingRole.id) {
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
    .where({
      rule_type: WorkflowRoleTypeModel.ROLE_TYPES.general,
    })
    .select(['workflow_rule.id', 'workflow_rule.display_name']);

  return permissions.map((permission) => ({
    id: permission.id,
    permission: permission.display_name,
  }));
};

const createRole = async (attributes) => {
  const newRole = attributes.role.trim();
  const accountId = parseAccountId(attributes.accountId);

  // Check if general role exist before creation
  const isRoleExist = await WorkflowRoleModel.isRoleExist(
    accountId,
    WorkflowRoleTypeModel.ROLE_TYPES.general,
    newRole
  );

  if (isRoleExist) {
    return errorHelper({
      message: 'Role already exist.',
      statusCode: 409,
    }).payload;
  }

  // Validate incoming role permissions are valid general role permissions
  let generalRolePermissions = [];

  if (attributes.permissions.length > 0) {
    generalRolePermissions = await WorkflowRuleModel.getGeneraRolePermissionsByIds(
      attributes.permissions
    );

    if (generalRolePermissions.length !== attributes.permissions.length) {
      return errorHelper({
        message: 'Invalid permissions.',
        statusCode: 422,
      }).payload;
    }
  }

  // Create new general role
  const generalRoleType = await WorkflowRoleTypeModel.getRoleType(
    WorkflowRoleTypeModel.ROLE_TYPES.general
  );

  const newGeneralRole = await WorkflowRoleModel.getQueryBuilder()
    .insert({
      name: newRole,
      role_type: generalRoleType.id,
      supplier: accountId,
      parent: WorkflowRoleModel.NO_PARENT,
      active: true,
    })
    .returning(['workflow_role.id', 'workflow_role.name']);

  const { id: newGeneralRoleId, name: newGeneralRoleName } = newGeneralRole[0];

  // Populate role permissions
  const roleRules = attributes.permissions.map((permisson) => ({
    workflow_rule: permisson,
    workflow_role: newGeneralRoleId,
  }));

  await WorkflowRoleRuleModel.getQueryBuilder().insert(roleRules);

  return {
    id: newGeneralRoleId,
    name: newGeneralRoleName,
    members: 0, // Role created now, so there can't be any members.
    permissions: generalRolePermissions.map((permission) => ({
      id: permission.id,
      permission: permission.display_name,
    })),
  };
};

const editRole = async (attributes) => {
  const accountId = parseAccountId(attributes.accountId);
  const roleId = parseInt(attributes.roleId, 10);
  const newRole = attributes.role.trim();

  const generalRoleType = await WorkflowRoleTypeModel.getRoleType(
    WorkflowRoleTypeModel.ROLE_TYPES.general
  );

  // validate role exist
  const currentRole = await WorkflowRoleModel.getQueryBuilder()
    .where('workflow_role.supplier', accountId)
    .where('workflow_role.role_type', generalRoleType.id)
    .where('workflow_role.active', true)
    .where('workflow_role.id', roleId)
    .first()
    .select(['workflow_role.name']);

  if (!currentRole) {
    return errorHelper({
      message: 'Role not found.',
      statusCode: 404,
    }).payload;
  }

  // Validate role permissions
  let generalRolePermissions = [];

  if (attributes.permissions.length > 0) {
    generalRolePermissions = await WorkflowRuleModel.getGeneraRolePermissionsByIds(
      attributes.permissions
    );

    if (generalRolePermissions.length !== attributes.permissions.length) {
      return errorHelper({
        message: 'Invalid permissions.',
        statusCode: 422,
      }).payload;
    }
  }

  // Get current role permissions
  const currentRolePermissions = await WorkflowRoleRuleModel.getQueryBuilder()
    .where('workflow_role_rule.workflow_role', roleId)
    .select([
      'workflow_role_rule.id as role_rule_id',
      'workflow_role_rule.workflow_rule',
    ]);

  // Check new role already exist before update
  if (currentRole.name !== newRole) {
    const isRoleExist = await WorkflowRoleModel.isRoleExist(
      accountId,
      WorkflowRoleTypeModel.ROLE_TYPES.general,
      newRole
    );

    if (isRoleExist) {
      return errorHelper({
        message: 'Role already exist.',
        statusCode: 409,
      }).payload;
    }

    await WorkflowRoleModel.getQueryBuilder()
      .where({ id: roleId })
      .update({ name: newRole });
  }

  const currentRolePermissionIds = [];

  // Extract permissions to delete: If current permission doesn't exist in incoming permission list, delete it.
  const deletePermissions = currentRolePermissions.reduce(
    (toDelete, permission) => {
      if (attributes.permissions.indexOf(permission.workflow_rule) === -1) {
        toDelete.push(permission.role_rule_id);
      }

      currentRolePermissionIds.push(permission.workflow_rule);

      return toDelete;
    },
    []
  );

  // Extract permissions to add: If incoming permission doesn't exist in current permission list, add it.
  const addPermissions = attributes.permissions.reduce((toAdd, permission) => {
    if (currentRolePermissionIds.indexOf(permission) === -1) {
      toAdd.push({ workflow_role: roleId, workflow_rule: permission });
    }

    return toAdd;
  }, []);

  if (deletePermissions.length > 0) {
    await WorkflowRoleRuleModel.getQueryBuilder()
      .whereIn('workflow_role_rule.id', deletePermissions)
      .del();
  }

  if (addPermissions.length > 0) {
    await WorkflowRoleRuleModel.getQueryBuilder().insert(addPermissions);
  }

  const response = {
    id: roleId,
    name: newRole,
    // members: TODO: Decide requirement of members count in edit role response, since it's a exepnsive query.
    permissions: generalRolePermissions.map((permission) => ({
      id: permission.id,
      permission: permission.display_name,
    })),
  };

  return response;
};

const deleteRole = async (attributes) => {
  const accountId = parseAccountId(attributes.accountId);
  const roleId = parseInt(attributes.roleId, 10);

  const generalRoleType = await WorkflowRoleTypeModel.getRoleType(
    WorkflowRoleTypeModel.ROLE_TYPES.general
  );

  // validate role exist
  const currentRole = await WorkflowRoleModel.getQueryBuilder()
    .where('workflow_role.supplier', accountId)
    .where('workflow_role.role_type', generalRoleType.id)
    .where('workflow_role.active', true)
    .where('workflow_role.id', roleId)
    .first()
    .select(['workflow_role.name']);

  if (!currentRole) {
    return errorHelper({
      message: 'Role not found.',
      statusCode: 404,
    }).payload;
  }

  // TODO: Clarify requirement about the impact on exisitng users assoicated with this role upon deletion

  await WorkflowRoleRuleModel.getQueryBuilder()
    .where('workflow_role_rule.workflow_role', roleId)
    .del();

  await WorkflowRoleModel.getQueryBuilder()
    .where('workflow_role.id', roleId)
    .update('active', false);

  return {
    message: 'Role is deleted.',
    statusCode: 200,
  };
};

const index = async (attributes) => {
  const accountId = parseAccountId(attributes.accountId);

  const generalRoleType = await WorkflowRoleTypeModel.getRoleType(
    WorkflowRoleTypeModel.ROLE_TYPES.general
  );

  // TODO: Implement pagination
  // TODO: Change role & rule assoication relationship to different data schema. i.e JSON
  // Get active roles & their respective rules associated with them
  const generalRoles = await WorkflowRoleModel.getQueryBuilder()
    .leftJoin(
      'workflow_role_rule',
      'workflow_role_rule.workflow_role',
      '=',
      'workflow_role.id'
    )
    .leftJoin(
      'workflow_rule',
      'workflow_rule.id',
      '=',
      'workflow_role_rule.workflow_rule'
    )
    .where({
      supplier: accountId,
      role_type: generalRoleType.id,
      active: true,
    })
    .orderBy('workflow_role.id')
    .select([
      'workflow_role.id as role_id',
      'workflow_role.name as role_name',
      'workflow_rule.id as rule_id',
      'workflow_rule.display_name as rule_display_name',
    ]);

  // Get active user count per general role
  const generalRolesIdSet = new Set(generalRoles.map((role) => role.role_id));
  const generalRoleIds = Array.from(generalRolesIdSet);

  // TODO: Implement 'SQL View' to map active user count for each role.
  const userCountPerRole = await UserWorkflowRoleModel.getUserCountByRoleIds(
    generalRoleIds
  );

  const response = generalRoleIds.map((roleId) => {
    const roles = generalRoles.filter((role) => role.role_id === roleId);

    const rolePermissions = roles.reduce((permissions, role) => {
      if (role.rule_id) {
        permissions.push({
          id: role.rule_id,
          permission: role.rule_display_name,
        });
      }

      return permissions;
    }, []);

    const roleUsers = userCountPerRole.find(
      (count) => count.workflow_role === roleId
    );

    return {
      id: roleId,
      name: roles[0].role_name,
      members: roleUsers ? parseInt(roleUsers.count, 10) : 0,
      permissions: rolePermissions,
    };
  });

  return response;
};

module.exports = {
  isRoleAvailable,
  getRolePermissions,
  createRole,
  editRole,
  deleteRole,
  index,
};
