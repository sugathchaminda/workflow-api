const Model = require('../model');
const knex = require('../db');

const PostingInvoiceItemModel = new Model('posting_invoice_item');

PostingInvoiceItemModel.getPostingResultsByInvoiceId = (invoiceId) => PostingInvoiceItemModel.getQueryBuilder()
  .select(
    'posting_invoice_item.account_number as account',
    'posting_invoice_item.account_name as description'
  )
  .sum({ amount: knex.raw('round(amount_document, 2)') })
  .where('posting_invoice_item.invoice', '=', invoiceId)
  .groupBy('account_number', 'account_name');

module.exports = PostingInvoiceItemModel;
