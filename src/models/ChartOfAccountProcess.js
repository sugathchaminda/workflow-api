/* eslint-disable func-names */
/* eslint-disable no-restricted-globals */
const Model = require('../model');

const ChartOfAccountProcessModel = new Model('chart_of_account_process');

ChartOfAccountProcessModel.getAccountProcessEntryBySupplier = (
  supplierId,
  transaction
) => {
  let query = ChartOfAccountProcessModel.getQueryBuilder();

  if (transaction) {
    query = query.transacting(transaction);
  }
  return query.where('supplier', '=', supplierId).first();
};

ChartOfAccountProcessModel.update = async (
  supplierId,
  metaData,
  transaction = null
) => {
  let query = ChartOfAccountProcessModel.getQueryBuilder();
  if (transaction) {
    query = query.transacting(transaction);
  }
  const updatedRecord = await query
    .update({ meta_data: metaData })
    .where('supplier', supplierId)
    .returning(['id']);

  return updatedRecord || [];
};

ChartOfAccountProcessModel.saveAccountProcessEntry = (entry, transaction) => {
  if (entry.id) {
    return ChartOfAccountProcessModel.getQueryBuilder()
      .update(entry)
      .where('id', '=', entry.id)
      .returning('id')
      .transacting(transaction);
  }
  return ChartOfAccountProcessModel.getQueryBuilder()
    .insert(entry)
    .returning('id')
    .transacting(transaction);
};

module.exports = ChartOfAccountProcessModel;
