/* eslint-disable camelcase */
/* eslint-disable func-names */
const Model = require('../model');
const WorkflowRoleType = require('./WorkflowRoleType');

const UserWorkflowRoleModel = new Model(
  'user_workflow_role as user_workflow_role'
);

// UserWorkflowRoleModel Specific Functions (write the functions as member functions)
// ex: UserWorkflowModel.create = function () {} -> use normal function instead of arrow function

/**
 * @description Fetch active workflow and general roles for passed user ids of a supplier
 * @param {Number} accountId
 * @param {Number} userIds
 * @returns {Array.<Object>} userRoles
 */
UserWorkflowRoleModel.fetchUserRolesForSupplier = async function (
  accountId,
  userIds
) {
  const userRoleRecords = await this.getQueryBuilder()
    .leftJoin(
      'workflow_role as workflow_role',
      'user_workflow_role.workflow_role',
      'workflow_role.id'
    )
    .leftJoin(
      'workflow_role_type as workflow_role_type',
      'workflow_role.role_type',
      'workflow_role_type.id'
    )
    .where('user_workflow_role.active', true)
    .whereIn('user_workflow_role.user', userIds)
    .where('workflow_role.supplier', accountId)
    .select([
      'user_workflow_role.id',
      'user_workflow_role.user',
      'user_workflow_role.workflow_role',
      'user_workflow_role.active',
      'workflow_role.name',
      'workflow_role.role_type',
      'workflow_role_type.type as roleTypeName',
      'workflow_role.supplier',
      'workflow_role.parent',
    ]);

  return userRoleRecords;
};

/**
 * @description Gets number of users of a role
 * @param {Number} roleId
 * @returns {Number} memberCount
 */
UserWorkflowRoleModel.getUserCountByRoleIds = async (roles) => {
  const userCounts = await UserWorkflowRoleModel.getQueryBuilder()
    .whereIn('workflow_role', roles)
    .where('active', true)
    .count('workflow_role')
    .groupBy('user_workflow_role.workflow_role')
    .select(['user_workflow_role.workflow_role']);

  return userCounts;
};

UserWorkflowRoleModel.fetchUsersForRoleId = async (roleId) => {
  const response = await UserWorkflowRoleModel.getQueryBuilder()
    .leftJoin('user as user', 'user.id', 'user_workflow_role.user')
    .where('user_workflow_role.workflow_role', roleId)
    .where('user_workflow_role.active', true)
    .select(['user.*', 'user_workflow_role.workflow_role']);

  return response;
};

UserWorkflowRoleModel.createOrUpdate = async (records, transaction = null) => {
  const updatedRecords = await UserWorkflowRoleModel.update(
    records,
    transaction
  );

  // filter the updated records from initial record list
  const updatedRecordIds = updatedRecords.map(
    ({ workflow_role }) => workflow_role
  );

  const freshInserts = records.filter(
    (record) => updatedRecordIds.indexOf(record.workflow_role) === -1
  );

  let insertedRecords = [];
  if (freshInserts.length > 0) {
    insertedRecords = await UserWorkflowRoleModel.create(
      freshInserts,
      transaction
    );
  }

  const response = [...updatedRecords, ...insertedRecords];

  return response;
};

UserWorkflowRoleModel.create = async (records, transaction = null) => {
  let query = UserWorkflowRoleModel.getQueryBuilder();
  if (transaction) {
    query = query.transacting(transaction);
  }

  const insertedRecords = await query
    .insert(records)
    .returning(['user_workflow_role.id', 'user_workflow_role.workflow_role']);

  return insertedRecords || [];
};

UserWorkflowRoleModel.update = async (records, transaction = null) => {
  const userAndRole = records.map(({ user, workflow_role }) => [
    user,
    workflow_role,
  ]);

  let query = UserWorkflowRoleModel.getQueryBuilder();
  if (transaction) {
    query = query.transacting(transaction);
  }

  // reactivate if the composite key / mapping already exist
  const updatedRecords = await query
    .update({
      active: true,
      updatedAt: new Date(),
    })
    .whereIn(['user', 'workflow_role'], userAndRole)
    .returning(['user_workflow_role.id', 'user_workflow_role.workflow_role']);

  return updatedRecords || [];
};

UserWorkflowRoleModel.remove = async (records, transaction) => {
  const userAndRole = records.map(({ user, workflow_role }) => [
    user,
    workflow_role,
  ]);

  const deactivatedRecordsQuery = UserWorkflowRoleModel.getQueryBuilder();
  if (transaction) {
    deactivatedRecordsQuery.transacting(transaction);
  }

  const deactivatedRecords = await deactivatedRecordsQuery
    .update({
      active: false,
      updatedAt: new Date(),
    })
    .whereIn(['user', 'workflow_role'], userAndRole)
    .returning(['user_workflow_role.id', 'user_workflow_role.workflow_role']);

  return deactivatedRecords;
};

UserWorkflowRoleModel.removeUsersRolesForSupplier = async (
  accountId,
  userId,
  transaction = null
) => {
  const query = UserWorkflowRoleModel.getQueryBuilder();
  const updateQuery = UserWorkflowRoleModel.getQueryBuilder();

  if (transaction) {
    query.transacting(transaction);
    updateQuery.transacting(transaction);
  }

  // get the active roles of user of the supplier
  const roles = await query
    .leftJoin(
      'workflow_role as workflow_role',
      'workflow_role.id',
      'user_workflow_role.workflow_role'
    )
    .where('workflow_role.supplier', accountId)
    .where('user_workflow_role.user', userId)
    .where('user_workflow_role.active', true)
    .select('user_workflow_role.id');

  // update the active to false
  const roleIds = roles.map((role) => role.id);
  const response = await updateQuery
    .update({
      active: false,
    })
    .whereIn('user_workflow_role.id', roleIds)
    .returning(['user_workflow_role.workflow_role']);

  return response;
};

UserWorkflowRoleModel.fetchUserWorkflowRole = async (accountId, userId) => {
  const response = await UserWorkflowRoleModel.getQueryBuilder()
    .leftJoin(
      'workflow_role as workflow_role',
      'workflow_role.id',
      'user_workflow_role.workflow_role'
    )
    .leftJoin(
      'workflow_role_type as workflow_role_type',
      'workflow_role_type.id',
      'workflow_role.role_type'
    )
    .where('workflow_role.supplier', accountId)
    .where('workflow_role.active', true)
    .where('workflow_role_type.type', WorkflowRoleType.ROLE_TYPES.workflow)
    .where('user_workflow_role.user', userId)
    .where('user_workflow_role.active', true)
    .select(['user_workflow_role.workflow_role']);

  return response;
};

module.exports = UserWorkflowRoleModel;
