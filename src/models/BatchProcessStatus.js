/* eslint-disable func-names */
/* eslint-disable no-restricted-globals */
const Model = require('../model');
const { batchProcessContextEnum } = require('../enums/accounting');

const BatchProcessStatusModel = new Model(
  'batch_process_status as batch_process_status'
);

BatchProcessStatusModel.create = async (
  supplierId,
  status,
  transaction = null
) => {
  let query = BatchProcessStatusModel.getQueryBuilder();
  if (transaction) {
    query = query.transacting(transaction);
  }
  const currentSupplier = await BatchProcessStatusModel.findBySupplierId(
    supplierId
  );

  let createOrUpdateRecords = [];

  if (currentSupplier.length > 0) {
    createOrUpdateRecords = await BatchProcessStatusModel.update(
      supplierId,
      batchProcessContextEnum.chart_of_accounts,
      status
    );
  } else {
    createOrUpdateRecords = await query
      .insert({
        supplier: supplierId,
        status,
        context: batchProcessContextEnum.chart_of_accounts,
      })
      .returning(['id']);
  }
  return createOrUpdateRecords;
};

BatchProcessStatusModel.update = async (
  supplierId,
  context,
  status,
  transaction = null
) => {
  let query = BatchProcessStatusModel.getQueryBuilder();
  if (transaction) {
    query = query.transacting(transaction);
  }

  const updatedRecord = await query
    .update({ status, context })
    .where('supplier', supplierId)
    .returning(['batch_process_status.id']);

  return updatedRecord || [];
};

BatchProcessStatusModel.findBySupplierId = async (supplierId) => {
  const result = await BatchProcessStatusModel.getQueryBuilder().where(
    'batch_process_status.supplier',
    supplierId
  );
  return result;
};

BatchProcessStatusModel.GetBatchProcess = (supplierId, context) => BatchProcessStatusModel.getQueryBuilder()
  .where('supplier', '=', supplierId)
  .andWhere('context', '=', context)
  .first();

module.exports = BatchProcessStatusModel;
