/* eslint-disable func-names */
const Model = require('../model');

const InviteWorkflowAliasModel = new Model(
  'invite_workflow_alias as invite_workflow_alias'
);

// InviteWorkflowAliasModel Specific Functions (write the functions as member functions)
// ex: InviteWorkflowAliasModel.create = () => {}

InviteWorkflowAliasModel.fetchValidInviteAliasesOfSupplier = async function (
  accountId
) {
  // valid until is a postgres timestamptz column, so the date should be converted to UTC string
  const now = new Date().toUTCString();

  const aliasRecords = await this.getQueryBuilder()
    .leftJoin('invite', 'invite.id', '=', 'invite_workflow_alias.invite')
    .where('invite.supplier', accountId)
    .where('invite.valid_until', '>=', now)
    .select(['invite_workflow_alias.alias']);

  const aliasTexts = aliasRecords.map((aliasRecord) => aliasRecord.alias);

  return aliasTexts;
};

InviteWorkflowAliasModel.create = async function (data) {
  const response = await this.getQueryBuilder()
    .insert(data)
    .returning(['alias']);

  return response;
};

InviteWorkflowAliasModel.isAliasUsedByInvitesForSupplier = async function (
  accountId,
  aliasText
) {
  // valid until is a postgres timestamptz column, so the date should be converted to UTC string
  const now = new Date().toUTCString();

  const response = await this.getQueryBuilder()
    .leftJoin('invite', 'invite.id', '=', 'invite_workflow_alias.invite')
    .where('invite.supplier', accountId)
    .where('invite.valid_until', '>=', now)
    .whereRaw(
      "LOWER(invite_workflow_alias.alias) LIKE '%' || LOWER(?) || '%'",
      aliasText
    )
    .select(['invite_workflow_alias.alias']);

  return response.length > 0;
};

InviteWorkflowAliasModel.getInviteAlias = async function (inviteIds) {
  const response = await this.getQueryBuilder()
    .whereIn('invite_workflow_alias.invite', inviteIds)
    .select([
      'invite_workflow_alias.id',
      'invite_workflow_alias.alias',
      'invite_workflow_alias.invite',
    ]);

  return response;
};

InviteWorkflowAliasModel.removeByInviteId = async function (
  inviteId,
  transaction = null
) {
  let query = this.getQueryBuilder();
  if (transaction) {
    query = query.transacting(transaction);
  }

  const response = await query
    .where('invite_workflow_alias.invite', inviteId)
    .del();

  return response;
};

module.exports = InviteWorkflowAliasModel;
