/* eslint-disable func-names */
const Model = require('../model');
const ApplicationError = require('../utils/ApplicationError');

const InvoiceWorkflowHistoryModel = new Model(
  'invoice_workflow_history as invoice_workflow_history'
);

InvoiceWorkflowHistoryModel.TYPE = {
  STATUS_CHANGED: 'StatusChanged',
  INVOICE_REASSIGNED: 'InvoiceReassigned',
};

InvoiceWorkflowHistoryModel.create = async (
  workflow,
  invoice,
  user,
  fromStatus,
  toStatus,
  fromUser,
  toUser,
  type,
  transaction = null
) => {
  const data = {
    workflow,
    invoice,
    user,
    from_status: fromStatus,
    to_status: toStatus,
    from_user: fromUser,
    to_user: toUser,
    type,
  };
  const query = InvoiceWorkflowHistoryModel.getQueryBuilder();

  if (transaction) {
    query.transacting(transaction);
  }

  const id = await query.insert(data).returning(['id']);

  if (id) {
    return id;
  }

  throw new ApplicationError({
    message: 'Failed to create invoice workflow history',
    statusCode: 500,
  });
};

InvoiceWorkflowHistoryModel.getInvoiceWorkflowHistory = async (
  workflow,
  invoice,
  orderBy = 'createdAt',
  order = 'desc'
) => InvoiceWorkflowHistoryModel.getQueryBuilder()
  .where('workflow', workflow)
  .where('invoice', invoice)
  .select()
  .orderBy(orderBy, order)
  .first();

module.exports = InvoiceWorkflowHistoryModel;
