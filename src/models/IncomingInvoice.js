/* eslint-disable func-names */
const Model = require('../model');

const IncomingInvoiceModel = new Model('incominginvoice as incominginvoice');

// IncomingInvoiceModel Specific Functions (write the functions as member functions)
// ex: IncomingInvoiceModel.create = function () {} -> use normal function instead of arrow function

IncomingInvoiceModel.fetchInvoiceRecieverData = async function (
  accountId,
  invoiceId
) {
  const response = await this.getQueryBuilder()
    .where('incominginvoice.id', invoiceId)
    .where('incominginvoice.supplier', accountId)
    .select(['incominginvoice.receiver_data']);

  return response;
};

IncomingInvoiceModel.getInvoicesByStatus = async (accountId, status) => {
  const response = IncomingInvoiceModel.getQueryBuilder()
    .leftJoin(
      'invoice_workflow',
      'invoice_workflow.invoice',
      'incominginvoice.id'
    )
    .where('invoice_workflow.supplier', accountId)
    .where('invoice_workflow.status', status)
    .select([
      'invoice_workflow.invoice',
      'incominginvoice.document_id',
      'incominginvoice.total',
      'incominginvoice.sender_data',
      'incominginvoice.currency',
      'incominginvoice.createdAt',
    ])
    .orderBy('incominginvoice.createdAt', 'desc');

  return response;
};

IncomingInvoiceModel.getInvoiceById = async (accountId, invoiceId, select = '[*]') => {
  const response = IncomingInvoiceModel.getQueryBuilder()
    .where('incominginvoice.id', invoiceId)
    .where('incominginvoice.supplier', accountId)
    .select(select);

  return response;
};

module.exports = IncomingInvoiceModel;
