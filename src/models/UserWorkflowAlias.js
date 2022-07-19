/* eslint-disable func-names */
const Model = require('../model');

const UserWorkflowAlias = new Model(
  'user_workflow_alias as user_workflow_alias'
);

// UserWorkflowAlias Specific Functions
// UserWorkflowAlias Specific Functions (write the functions as member functions)
// ex: UserWorkflowAlias.create = function () {} -> use normal function instead of arrow function

// -----------------------------------------------------------------------------
// Fetch active workflow aliases for passed user ids of a supplier
// -----------------------------------------------------------------------------
UserWorkflowAlias.fetchUserWorkflowAliasForSupplier = async function (
  accountId,
  userIds
) {
  const userAliasRecords = await UserWorkflowAlias.getQueryBuilder()
    .leftJoin(
      'workflow_alias as workflow_alias',
      'user_workflow_alias.alias',
      'workflow_alias.id'
    )
    .where('user_workflow_alias.active', true)
    .whereIn('user_workflow_alias.user', userIds)
    .where('workflow_alias.supplier', accountId)
    .select([
      'user_workflow_alias.id',
      'user_workflow_alias.user',
      'user_workflow_alias.alias',
      'user_workflow_alias.active',
      'workflow_alias.text',
      'workflow_alias.supplier',
    ]);

  return userAliasRecords;
};

UserWorkflowAlias.fetchActiveAliasesOfSupplier = async function (accountId) {
  const aliasRecords = await UserWorkflowAlias.getQueryBuilder()
    .leftJoin(
      'workflow_alias as workflow_alias',
      'user_workflow_alias.alias',
      'workflow_alias.id'
    )
    .where('user_workflow_alias.active', true)
    .where('workflow_alias.supplier', accountId)
    .select(['workflow_alias.text']);

  const aliasTexts = aliasRecords.map((aliasRecord) => aliasRecord.text);

  return aliasTexts;
};

UserWorkflowAlias.createOrUpdate = async (records, transaction = null) => {
  const updatedAliases = await UserWorkflowAlias.update(records, transaction);

  // filter the updated records from initial record list
  const updatedRecordIds = updatedAliases.map(({ alias }) => alias);
  const freshInserts = records.filter(
    (record) => updatedRecordIds.indexOf(record.alias) === -1
  );

  let insertedRecords = [];
  if (freshInserts.length > 0) {
    insertedRecords = await UserWorkflowAlias.create(freshInserts, transaction);
  }

  const response = [...updatedAliases, ...insertedRecords];

  return response;
};

UserWorkflowAlias.create = async (records, transaction = null) => {
  let query = UserWorkflowAlias.getQueryBuilder();
  if (transaction) {
    query = query.transacting(transaction);
  }

  const insertedRecords = query
    .insert(records)
    .returning(['user_workflow_alias.id', 'user_workflow_alias.alias']);

  return insertedRecords || [];
};

UserWorkflowAlias.update = async (records, transaction = null) => {
  // constructer filter condition
  const userAndAliases = records.map(({ user, alias }) => [user, alias]);

  let query = UserWorkflowAlias.getQueryBuilder();
  if (transaction) {
    query = query.transacting(transaction);
  }

  const updatedAliases = await query
    .update({
      active: true,
    })
    .whereIn(['user', 'alias'], userAndAliases)
    .returning(['user_workflow_alias.id', 'user_workflow_alias.alias']);

  return updatedAliases || [];
};

UserWorkflowAlias.remove = async (deleteIds, transaction) => {
  const deactivatedRecordsQuery = UserWorkflowAlias.getQueryBuilder();
  if (transaction) {
    deactivatedRecordsQuery.transacting(transaction);
  }
  const deactivatedRecords = await deactivatedRecordsQuery
    .update({
      active: false,
    })
    .whereIn('user_workflow_alias.id', deleteIds)
    .returning(['user_workflow_alias.id', 'user_workflow_alias.alias']);

  return deactivatedRecords;
};

UserWorkflowAlias.removeUsersAliasForSupplier = async (
  accountId,
  userId,
  transaction = null
) => {
  const query = UserWorkflowAlias.getQueryBuilder();
  const updateQuery = UserWorkflowAlias.getQueryBuilder();

  if (transaction) {
    query.transacting(transaction);
    updateQuery.transacting(transaction);
  }

  // get the active roles of user of the supplier
  const roles = await query
    .leftJoin(
      'workflow_alias as workflow_alias',
      'workflow_alias.id',
      'user_workflow_alias.alias'
    )
    .where('workflow_alias.supplier', accountId)
    .where('user_workflow_alias.user', userId)
    .where('user_workflow_alias.active', true)
    .select('user_workflow_alias.id');

  // update the active to false
  const roleIds = roles.map((role) => role.id);
  const response = await updateQuery
    .update({
      active: false,
    })
    .whereIn('user_workflow_alias.id', roleIds)
    .returning(['user_workflow_alias.alias']);

  return response;
};

UserWorkflowAlias.fetchUserByAliasId = async function (aliasId) {
  const response = await UserWorkflowAlias.getQueryBuilder()
    .where('user_workflow_alias.alias', aliasId)
    .where('user_workflow_alias.active', true)
    .select(['user_workflow_alias.user'])
    .first();

  return response;
};

module.exports = UserWorkflowAlias;
