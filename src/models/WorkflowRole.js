/* eslint-disable no-console */
/* eslint-disable no-restricted-globals */
/* eslint-disable func-names */

const knex = require('../db');
const Model = require('../model');
const workflowRoleTypeModel = require('./WorkflowRoleType');
const workflowRuleModel = require('./WorkflowRule');
const workflowRoleRuleModel = require('./WorkflowRoleRule');
const WorkflowRuleConditionModel = require('./WorkflowRuleCondition');
const InviteWorkflowRole = require('./InviteWorkflowRole');
const WorkflowRoleRuleModel = require('./WorkflowRoleRule');

const WorkflowRoleModel = new Model('workflow_role as workflow_role');

WorkflowRoleModel.NO_PARENT = 0;

WorkflowRoleModel.PAGINATION = {
  per_page: 10,
};

// WorkflowRoleModel Specific Functions (write the functions as member functions)
// ex: WorkflowRoleModel.create = function () {} -> use normal function instead of arrow function

/**
 * @description Returns whether the roleId is exist for supplier
 * @param Number accountId supplier id
 * @param String roleType
 * @param String new role name
 * @return Boolean
 */
WorkflowRoleModel.isValidRoleIdForSupplier = async (accountId, roleId) => {
  const response = await WorkflowRoleModel.getQueryBuilder()
    .where('workflow_role.supplier', accountId)
    .where('workflow_role.id', roleId)
    .where('workflow_role.active', true)
    .select(['workflow_role.id']);

  return response.length > 0;
};

/**
 * @description Returns whether the role is exist for supplier
 * @param Number accountId supplier id
 * @param String roleType
 * @param String new role name
 * @return Boolean
 */
WorkflowRoleModel.isRoleExist = async (accountId, roleType, role, parentId) => {
  const query = WorkflowRoleModel.getQueryBuilder()
    .join(
      'workflow_role_type',
      'workflow_role.role_type',
      '=',
      'workflow_role_type.id'
    )
    .where('workflow_role_type.type', roleType)
    .where('workflow_role.supplier', accountId)
    .where('workflow_role.name', role)
    .where('workflow_role.active', true)
    .select(['workflow_role.id']);

  // parent become '0' for a general role & top level role.
  if (parentId >= 0) {
    query.where('workflow_role.parent', parentId);
  }

  const roles = await query;

  return roles.length > 0;
};

/**
 * @description Returns a filtered list of role ids out of passed role ids for a supplier
 * @param {Number} roleIds
 * @param {Number} accountId
 * @param {Number} roleType
 */
WorkflowRoleModel.filterPermissionedRolesIds = async function (
  roleIds,
  accountId,
  roleType = '',
  transaction = null
) {
  const commonQuery = this.getQueryBuilder();
  if (transaction) {
    commonQuery.transacting(transaction);
  }

  commonQuery
    .join(
      'workflow_role_type',
      'workflow_role.role_type',
      '=',
      'workflow_role_type.id'
    )
    .whereIn('workflow_role.id', roleIds)
    .where('workflow_role.active', true)
    .where('workflow_role.supplier', accountId);

  if (roleType) {
    commonQuery.where('workflow_role_type.type', roleType);
  }

  const response = await commonQuery.select(['workflow_role.id']);

  return response;
};

/**
 * @description Returns true if the role is signlevel workflow role
 * @param {Number} roleId
 * @param {Number} accountId
 * @returns {Boolean} isParentRole
 */
WorkflowRoleModel.isParentRole = async function (
  accountId,
  roleId,
  transation = null
) {
  const query = WorkflowRoleModel.getQueryBuilder();

  if (transation) {
    query.transacting(transation);
  }

  query
    .where('workflow_role.parent', roleId)
    .where('workflow_role.supplier', accountId)
    .where('workflow_role.active', true)
    .count('id');

  const response = await query;

  const childs = response[0].count;

  return childs > 0;
};

/**
 * @description Fetch workflow or general or all roles for a supplier based on type
 * @param {Number} roleId
 * @param {Number} accountId
 * @returns {Boolean} isParentRole
 */
WorkflowRoleModel.fetchRolesForSupplier = async function (accountId) {
  const response = await this.getQueryBuilder()
    .leftJoin(
      'workflow_role_type as workflow_role_type',
      'workflow_role.role_type',
      '=',
      'workflow_role_type.id'
    )
    .fullOuterJoin(
      'user_workflow_role as user_workflow_role',
      'user_workflow_role.workflow_role',
      '=',
      'workflow_role.id'
    )
    .where('workflow_role.supplier', accountId)
    .where('workflow_role.active', true)
    .orderBy('workflow_role.parent', 'asc')
    .count('user_workflow_role.id as members')
    .groupBy('workflow_role.id', 'workflow_role_type.type')
    .select([
      'workflow_role.id',
      'workflow_role.name',
      'workflow_role.parent',
      'workflow_role_type.type',
    ]);

  return response;
};

WorkflowRoleModel.isInsertableRole = async function (
  accountId,
  roleId,
  transaction = null
) {
  // check for non empty signlevel role
  // check whether the role is a parent of other roles
  const isParent = await this.isParentRole(accountId, roleId, transaction);
  if (!isParent) {
    return true;
  }

  const membersCountQuery = this.getQueryBuilder();
  if (transaction) {
    membersCountQuery.transacting(transaction);
  }
  membersCountQuery
    .leftJoin(
      'user_workflow_role as user_workflow_role',
      'user_workflow_role.workflow_role',
      'workflow_role.id'
    )
    .where('workflow_role.id', roleId)
    .where('workflow_role.supplier', accountId)
    .where('workflow_role.active', true)
    .where('user_workflow_role.active', true)
    .select(['workflow_role.*', 'user_workflow_role.active as user_active']);

  const membersCount = await membersCountQuery;

  // if is parent and count is  greater than 0 -> it's not insertable
  if (membersCount.length > 0) {
    return false;
  }

  // is any valid invites are using the role
  const now = new Date().toUTCString();
  const isAnyInviteForTheRoleQuery = this.getQueryBuilder();
  if (transaction) {
    isAnyInviteForTheRoleQuery.transacting(transaction);
  }

  isAnyInviteForTheRoleQuery
    .leftJoin(
      'invite_workflow_role as invite_workflow_role',
      'invite_workflow_role.workflow_role',
      'workflow_role.id'
    )
    .leftJoin('invite as invite', 'invite.id', 'invite_workflow_role.invite')
    .where('invite_workflow_role.workflow_role', roleId)
    .where('workflow_role.supplier', accountId)
    .where('workflow_role.active', true)
    .where('invite.valid_until', '>=', now);
  const isAnyInviteForTheRole = await isAnyInviteForTheRoleQuery;

  if (isAnyInviteForTheRole.length > 0) {
    return false;
  }

  return true;
};

/**
 * @description Fetch a workflow role according to given parameters.
 * @param Number accountId
 * @param String roleType
 * @param Object options { roleId, parentId, roleName, count_members }
 * @return {}
 */
WorkflowRoleModel.getRole = async (accountId, roleType, options = {}) => {
  const workflowRoleType = await workflowRoleTypeModel.getRoleType(roleType);

  const query = WorkflowRoleModel.getQueryBuilder().first();

  if (options.count_members) {
    query.leftJoin(
      'user_workflow_role as user_workflow_role',
      'user_workflow_role.workflow_role',
      'workflow_role.id'
    );
  }

  query
    .where('workflow_role.role_type', workflowRoleType.id)
    .where('workflow_role.supplier', accountId)
    .where('workflow_role.active', true);

  if (options.roleId) {
    query.where('workflow_role.id', options.roleId);
  }

  // parent become '0' for a general role & top level role.
  if (options.parentId >= 0) {
    query.where('workflow_role.parent', options.parentId);
  }

  if (options.roleName) {
    query.where('workflow_role.name', options.roleName);
  }

  if (options.active) {
    query.where('workflow_role.active', true);
  }

  if (options.excludingIds) {
    query.whereNotIn('workflow_role.id', options.excludingIds);
  }

  if (options.count_members) {
    query.groupBy('workflow_role.id');
  }

  const selects = [
    'workflow_role.id',
    'workflow_role.name',
    'workflow_role.role_type',
    'workflow_role.supplier',
    'workflow_role.parent',
    'workflow_role.active',
    'workflow_role.sign_role',
  ];

  if (options.count_members) {
    selects.push(
      knex.raw(
        'sum( case when user_workflow_role.active = true then 1 else 0 end) as members'
      )
    );
  }

  query.select(selects);

  const role = await query;

  if (role && options.count_members) {
    role.members = parseInt(role.members, 10);
  }

  return role;
};

/**
 * @description Get top-level workflow role of the supplier.
 * @param Number accountId
 * @param Boolean active
 * @return {}
 */
WorkflowRoleModel.getTopLevelRole = async (accountId, active) => {
  const query = WorkflowRoleModel.getQueryBuilder()
    .join(
      'workflow_role_type',
      'workflow_role.role_type',
      '=',
      'workflow_role_type.id'
    )
    .where('workflow_role_type.type', workflowRoleTypeModel.ROLE_TYPES.workflow)
    .where('workflow_role.supplier', accountId)
    .where('workflow_role.parent', WorkflowRoleModel.NO_PARENT);

  if (active) {
    query.where('workflow_role.active', active);
  }

  const topLevelRole = await query
    .first()
    .select(['workflow_role.id', 'workflow_role.active']);

  return topLevelRole;
};

/**
 * @description Get saved workflow hierarchy from database & traverse it to create the tree.
 * @param Number accountId
 * @return {}
 */
WorkflowRoleModel.fetchWorkflowHierarchy = async (accountId) => {
  const workflowRoleType = await workflowRoleTypeModel.getRoleType(
    workflowRoleTypeModel.ROLE_TYPES.workflow
  );

  const results = await knex.raw(`
  with role_members as (
    select
      workflow_role.id,
      sum( case when user_workflow_role.active = true then 1 else 0 end) as members,
      workflow_role.name,
      workflow_role.parent,
      workflow_role.supplier,
      workflow_role.sign_role
    from
      workflow_role
    full join user_workflow_role user_workflow_role on
      user_workflow_role.workflow_role = workflow_role.id
    where
      workflow_role.role_type = ${workflowRoleType.id}
      and workflow_role.active = true
      and supplier = ${accountId}
    group by
      workflow_role.id
    order by
      workflow_role.parent ) ,
    role_spending_limit as (
    select
      wrm.id as id,
      wrm.members as members ,
      wrm.name as name,
      wrm.parent as parent,
      wrm.supplier as supplier,
      wrc.value as spending_limit,
      wrm.sign_role as sign_role
    from
      role_members wrm
    inner join workflow_role_rule wrl on
      wrl.workflow_role = wrm.id
    inner join workflow_rule_condition wrc on
      wrc.workflow_role_rule = wrl.id
      and wrc."type" = 'spending_limit' ),
    role_members_name as (
    select
      rsl.id,
      rsl.members,
      rsl.name,
      rsl.parent,
      rsl.supplier,
      rsl.spending_limit,
      u.name as member_name,
      rsl.sign_role as sign_role
    from
      role_spending_limit rsl
    left join user_workflow_role uwr on
      rsl.id = uwr.workflow_role
      and uwr.active = true
      and rsl.sign_role = true
    left join "user" u on
      u.id = uwr."user"
    order by
      parent )
    select
      *
    from
      role_members_name

    `);

  return WorkflowRoleModel.buildHierarchy(results.rows);
};

/**
 * @description Return the workflow hierarchy (tree)
 * @param Array hierarchy
 * @return {}
 */
WorkflowRoleModel.buildHierarchy = async (hierarchy) => {
  const roleIds = []; // to fetch invites per role

  const mappedArr = hierarchy.reduce((map, node) => {
    /* eslint-disable no-param-reassign */
    map[node.id] = node;
    map[node.id].subroles = [];
    roleIds.push(node.id); // to fetch invites
    return map;
  }, {});

  // Used to invite counts for each role
  // which is useful for front end validation which deals with assigning users to signin role
  const activeInvitesWithRoles = await InviteWorkflowRole.fetchInviteCountPerRoles(
    roleIds
  );
  const inviteCountToRoleMap = activeInvitesWithRoles.reduce((acc, roleRec) => {
    acc[roleRec.workflow_role] = parseInt(roleRec.count, 10);
    return acc;
  }, {});

  const tree = [];

  Object.keys(mappedArr).forEach((key) => {
    const node = mappedArr[key];

    const role = {
      id: node.id,
      name: node.name,
      spending_limit: node.spending_limit,
      members_count: parseInt(node.members, 10),
      invites: inviteCountToRoleMap[node.id] || 0,
    };

    if (node.sign_role) {
      role.members = node.member_name;
    } else {
      role.members = `${node.members} ${
        parseInt(node.members, 10) === 1 ? 'member' : 'members'
      }`;
    }

    role.subroles = node.subroles;

    if (node.parent) {
      mappedArr[node.parent].subroles.push(role);
    } else {
      tree.push(role);
    }
  });

  return tree[0];
};

/**
 * @description Create or Update (re-activate) workflow role. Create role+rule association. Create role_rule+rule_condition association.
 * @param Number accountId
 * @param {*} role
 * @param {*} options
 */
WorkflowRoleModel.createOrUpdateWorkflowRole = async (
  accountId,
  role,
  options = {},
  transaction = null
) => {
  // Database operations (insert & update) related to this function, executes under a transaction since this operation
  // has effect across multiple tables (workflow_role_rule, workflow_rule_condition)
  if (!transaction) {
    transaction = await knex.transaction();
  }

  try {
    // IF "roleId" update the workflow role ELSE create a new role
    const query = WorkflowRoleModel.getQueryBuilder()
      .transacting(transaction)
      .returning([
        'workflow_role.id',
        'workflow_role.parent',
        'workflow_role.sign_role',
      ]);

    if (options.roleId) {
      query
        .where({
          id: options.roleId,
        })
        .update(role);
    } else {
      query.insert(role);
    }

    const workflowRoleResults = await query;
    const workflowRole = workflowRoleResults[0];

    // If parent is not a sign-role yet, make it a sign-role (workflow role become a sign-role when it has one or more subroles).
    if (options.parent) {
      if (!options.parent.sign_role) {
        await WorkflowRoleModel.getQueryBuilder()
          .transacting(transaction)
          .where({
            id: options.parent.id,
          })
          .update({ sign_role: true });
      }
    }

    // Create role's rules association
    const permissions = await workflowRuleModel.getWorkflowRolePermissions();

    const roleRules = await workflowRoleRuleModel.createRoleRules(
      workflowRole.id,
      permissions.ruleIds,
      transaction
    );

    // Create rule conditions related to a rule
    if (options.conditions) {
      await WorkflowRuleConditionModel.createRuleConditions(
        roleRules,
        permissions.rules,
        options.conditions,
        transaction
      );
    }

    await transaction.commit();

    return workflowRole;
  } catch (error) {
    console.log('Create or update workflow role: ', error);
    await transaction.rollback();

    throw error;
  }
};

/**
 * @description Delete workflow-role & associated role-rule + role-rule-conditions.
 * @param Number roleId
 * @param Object transaction
 */
WorkflowRoleModel.deleteWorkflowRole = async (role, accountId, transaction) => {
  if (!transaction) {
    throw Error('Delete workflow-role requires a transaction.');
  }

  const roleRules = await WorkflowRoleRuleModel.getRulesForRoleIds([role.id]);

  const roleRulesIds = roleRules.map((roleRule) => roleRule.role_rule_id);

  // Delete conditions associated with the role rules.
  await WorkflowRuleConditionModel.getQueryBuilder()
    .transacting(transaction)
    .whereIn('workflow_rule_condition.workflow_role_rule', roleRulesIds)
    .del();

  // Delete role-rules
  await WorkflowRoleRuleModel.getQueryBuilder()
    .transacting(transaction)
    .where('workflow_role_rule.workflow_role', role.id)
    .del();

  // Deactivate role
  await WorkflowRoleModel.getQueryBuilder()
    .transacting(transaction)
    .where('workflow_role.id', role.id)
    .update({ active: false, sign_role: false });
};

module.exports = WorkflowRoleModel;
