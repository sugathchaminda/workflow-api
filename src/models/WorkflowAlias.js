/* eslint-disable func-names */
const Model = require('../model');

const WorkflowAliasModel = new Model('workflow_alias as workflow_alias');

WorkflowAliasModel.fetchAliasesForSupplier = async function (accountId) {
  const roles = await this.getQueryBuilder()
    .where('workflow_alias.supplier', accountId)
    .select(['workflow_alias.id', 'workflow_alias.text']);

  return roles;
};

WorkflowAliasModel.isAliasUsedForSupplier = async function (
  accountId,
  aliasText
) {
  const response = await this.getQueryBuilder()
    .rightJoin(
      'user_workflow_alias as user_workflow_alias',
      'user_workflow_alias.alias',
      'workflow_alias.id'
    )
    .where('workflow_alias.supplier', accountId)
    .whereRaw(
      "LOWER(workflow_alias.text) LIKE '%' || LOWER(?) || '%'",
      aliasText
    )
    .where('user_workflow_alias.active', true)
    .select(['workflow_alias.id']);

  return response.length > 0;
};

WorkflowAliasModel.fetchAvaliableAliasesFromRecords = async function (records) {
  const supplierAndAliases = records.map(({ supplier, text }) => [
    supplier,
    text,
  ]);

  const fetchAvaliableAliases = await this.getQueryBuilder()
    .whereIn(['supplier', 'text'], supplierAndAliases)
    .select(['workflow_alias.id', 'workflow_alias.text']);

  return fetchAvaliableAliases;
};

WorkflowAliasModel.validateAndCreate = async function (
  records,
  transaction = null
) {
  const fetchAvaliableAliases = await this.fetchAvaliableAliasesFromRecords(
    records
  );

  const existingAlias = fetchAvaliableAliases.reduce(
    (aliasObj, aliasRec) => {
      aliasObj.existingAliasIds.push(aliasRec.id);
      aliasObj.existingAliasTexts.push(aliasRec.text);
      return aliasObj;
    },
    { existingAliasIds: [], existingAliasTexts: [] }
  );

  // fresh aliases
  const freshAliases = records.filter(
    (rec) => existingAlias.existingAliasTexts.indexOf(rec.text) === -1
  );

  let newAliases = [];
  if (freshAliases.length > 0) {
    newAliases = await this.create(freshAliases, transaction);
  }

  const newAliasIds = newAliases.map((alias) => alias.id);

  const response = [...existingAlias.existingAliasIds, ...newAliasIds];

  return response;
};

WorkflowAliasModel.create = async function (records, transaction = null) {
  let query = this.getQueryBuilder();

  if (transaction) {
    query = query.transacting(transaction);
  }

  const newAliases = await query
    .insert(records)
    .returning(['workflow_alias.id', 'workflow_alias.text']);

  return newAliases;
};

WorkflowAliasModel.fetchAliasByText = async function (accountId, aliasText) {
  const response = await this.getQueryBuilder()
    .whereRaw('LOWER(text) = LOWER(?)', aliasText)
    .where('workflow_alias.supplier', accountId)
    .first();

  return response;
};

module.exports = WorkflowAliasModel;
