/* eslint-disable func-names */
const Model = require('../model');
const ApplicationError = require('../utils/ApplicationError');

const IncomingInvoiceItemModel = new Model('incominginvoiceitem');

IncomingInvoiceItemModel.getLineItemTotal = async (itemId) => {
  // get the line item total amount
  const itemValue = await IncomingInvoiceItemModel.getQueryBuilder()
    .select([
      'incominginvoiceitem.quantity',
      'incominginvoiceitem.vat_amount_per_item',
      'incominginvoiceitem.price',
    ])
    .where('incominginvoiceitem.id', itemId);

  if (itemValue.length <= 0) {
    throw new ApplicationError({
      message: 'No line item available for the given ID',
      statusCode: 404,
    });
  }
  return (
    parseFloat(itemValue[0].quantity)
    * (parseFloat(itemValue[0].price)
      + parseFloat(itemValue[0].vat_amount_per_item))
  );
};

IncomingInvoiceItemModel.isInvoiceItemBelongsToAccount = async (
  accountId,
  itemId
) => {
  const response = await IncomingInvoiceItemModel.getQueryBuilder()
    .select('incominginvoice.supplier')
    .where('incominginvoiceitem.id', itemId)
    .innerJoin(
      'incominginvoice',
      'incominginvoiceitem.invoice',
      '=',
      'incominginvoice.id'
    );

  if (response.length > 0 && response[0].supplier === accountId) {
    return true;
  }
  return false;
};

IncomingInvoiceItemModel.getInvoiceItemsByInvoice = async (invoiceId) => {
  const response = await IncomingInvoiceItemModel.getQueryBuilder().where(
    'invoice',
    invoiceId
  );

  return response;
};

module.exports = IncomingInvoiceItemModel;
