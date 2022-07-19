/* eslint-disable arrow-body-style */
/* eslint-disable func-names */
const knex = require('../db');
const Model = require('../model');
const ApplicationError = require('../utils/ApplicationError');

const InvoiceWorkflowModel = new Model('invoice_workflow as invoice_workflow');

InvoiceWorkflowModel.STATUS = {
  TO_ASSIGN: 'ToAssign',
  TO_APPROVE: 'ToApprove',
  TO_SIGN: 'ToSign',
  SIGNED: 'Signed',
  CANCELLED: 'Cancelled',
  HOLD: 'Hold',
  SIGNED_LOCKED: 'SignedLocked',
};

// InvoiceWorkflowModel Specific Functions (write the functions as member functions)
// ex: InvoiceWorkflowModel.create = function () {} -> use normal function instead of arrow function

InvoiceWorkflowModel.isInvoiceWorkflowExistForInvoice = async function (
  invoiceId
) {
  const response = await this.getQueryBuilder().where(
    'invoice_workflow.invoice',
    invoiceId
  );

  return response.length > 0;
};

InvoiceWorkflowModel.isInvoiceAssignedToUser = async function (
  accountId,
  userId,
  invoiceId,
  checkStatus = true
) {
  const query = this.getQueryBuilder()
    .where('invoice_workflow.invoice', invoiceId)
    .where('invoice_workflow.supplier', accountId)
    .where('invoice_workflow.assigned_to', userId)
    .first();

  if (checkStatus) {
    query.where('invoice_workflow.status', this.STATUS.TO_APPROVE);
  }

  const response = await query;
  return response;
};

InvoiceWorkflowModel.isInvoiceCancelledOrLocked = async (
  accountId,
  invoiceId
) => {
  const response = await InvoiceWorkflowModel.getQueryBuilder()
    .where('invoice_workflow.invoice', invoiceId)
    .where('invoice_workflow.supplier', accountId)
    .whereIn('invoice_workflow.status', [
      InvoiceWorkflowModel.STATUS.CANCELLED,
      InvoiceWorkflowModel.STATUS.SIGNED_LOCKED,
    ])
    .first();

  return response;
};

InvoiceWorkflowModel.getAssignedInvoicesCount = async function (
  supplierId,
  userId
) {
  const count = await this.getQueryBuilder()
    .where('invoice_workflow.assigned_to', userId)
    .andWhere('invoice_workflow.supplier', supplierId)
    .whereIn('invoice_workflow.status', [
      InvoiceWorkflowModel.STATUS.TO_APPROVE,
      InvoiceWorkflowModel.STATUS.TO_SIGN,
    ])
    .count('invoice_workflow.id as invoices_count');

  return parseInt(count[0].invoices_count, 10);
};

/**
 * @description Fetch invoices associated with a specific role-id in given statuses.
 * @param Number roleId
 * @param Array statuses : The array of statuses to be included.
 */
InvoiceWorkflowModel.getInvoicesByRole = async (
  roleId,
  statuses,
  transaction = null
) => {
  const query = InvoiceWorkflowModel.getQueryBuilder();

  if (transaction) {
    query.transacting(transaction);
  }

  query
    .select(
      'invoice_workflow.invoice',
      'invoice_workflow.status',
      'invoice_workflow.assigned_to'
    )
    .where('invoice_workflow.workflow_role', roleId)
    .whereIn('invoice_workflow.status', statuses);

  const results = await query;

  return results;
};

/**
 * @description Fetch invoices assigned to a particular user
 * @param Number userId : id of the user
 * @param Number accountId : id of the supplier
 * @param Array statuses : statuses that should be considered.
 */
InvoiceWorkflowModel.getAssignedInvoicesByUserIDAndStatus = async (
  userId,
  accountId,
  statuses,
  transaction = null
) => {
  const query = InvoiceWorkflowModel.getQueryBuilder();

  if (transaction) {
    query.transacting(transaction);
  }

  const results = await query
    .select('invoice_workflow.invoice', 'invoice_workflow.status')
    .where('invoice_workflow.assigned_to', userId)
    .where('invoice_workflow.supplier', accountId)
    .whereIn('invoice_workflow.status', statuses);

  return results;
};

/**
 * @description Fetch invoices assigned to a user.
 * @param Number accountId
 * @param Number userId
 * @param Array  statuses : The array of statuses to be included. i.e [ ToApprove, ToSign ]
 */
InvoiceWorkflowModel.getInvoicesAssignedToUser = async (
  accountId,
  userId,
  statuses = [
    InvoiceWorkflowModel.STATUS.TO_APPROVE,
    InvoiceWorkflowModel.STATUS.TO_SIGN,
  ]
) => {
  const statusesString = statuses.map((status) => `'${status}'`).toString();

  const results = await knex.raw(
    `SELECT
      iw.invoice AS invoice_id,
      iw.status,
      i.document_id AS invoice_num,
      i.total AS amount,
      i.sent_at,
      i.sender_data->'company_name' AS sender,
      i.currency,
      (SELECT COUNT(ii.id) FROM incominginvoiceitem AS ii WHERE ii.invoice = i.id) AS invoice_items,
      approved_user.approved_user_name,
      approved_user.approved_date
    FROM
    invoice_workflow AS iw
    INNER JOIN incominginvoice AS i ON
      i.id = iw.invoice
    LEFT JOIN (
      SELECT
        iwh.invoice,
        u."name" AS approved_user_name,
        iwh."createdAt" AS approved_date
      FROM
        invoice_workflow_history AS iwh
      INNER JOIN public."user" u on u.id = iwh.user 
      WHERE iwh.to_status = 'ToSign' 
      AND iwh.from_status = 'ToApprove'
    ) AS approved_user on approved_user.invoice = iw.invoice
    WHERE
      iw.assigned_to = ?
      AND iw.supplier = ?
      AND iw.status in ( ${statusesString} )`,
    [userId, accountId]
  );

  return results.rows;
};

/**
 * @description Check if the invoice belongs to specified account
 * @param Number accountId
 * @param Number invoiceId
 */
InvoiceWorkflowModel.isInvoiceBelongsToAccount = async (
  accountId,
  invoiceId
) => {
  const response = await InvoiceWorkflowModel.getQueryBuilder().where({
    supplier: accountId,
    invoice: invoiceId,
  });

  return response.length > 0;
};

/**
 * @description Get invoice by id.
 * @param Number accountId
 * @param Number invoiceId
 */
InvoiceWorkflowModel.getInvoiceById = async (accountId, invoiceId) => {
  const results = await knex.raw(
    `select
    iw.invoice,
    iw.assigned_to,
    iw.status,
    iw.assigned_to as asignee_id,
    iw.supplier,
    i.document_id as invoice_num,
    i.order_number,
    i.sender_data -> 'company_name' as company_name,
    i.receiver_data -> 'reference' as your_reference,
    i.sent_at as issue_date,
    i.due_date,
    i.due_days as payment_terms,
    i.sender_data -> 'our_reference' as our_reference,
    i.message,
    i.vat_sum as vat_amount,
    i.subtotal as net_total,
    i.total as total,
    u."name" as assignee_name,
    u.image_url as assignee_avatar_url,
    json_agg( jsonb_build_object(
    'id', item.id,
    'category', item.category,
    'item_num', item.product_data -> 'product_number',
    'quantity', item.quantity,
    'unit_price', item.product_data->'local_price',
    'name', item.product_data-> 'name' ) )::jsonb as items
  from
    invoice_workflow iw
  inner join incominginvoice i on
    i.id = iw.invoice
  inner join supplier as s on
    s.id = iw.supplier
  left join "user" u on
    u.id = iw.assigned_to
  left join incominginvoiceitem as item on
    item.invoice = iw.invoice
  where
    iw.invoice = ${invoiceId}
    and iw.supplier = ${accountId}
  group by
    iw.invoice,
    iw.assigned_to,
    iw.status,
    iw.supplier,
    asignee_id,
    invoice_num,
    i.order_number,
    company_name,
    your_reference,
    issue_date,
    i.due_date,
    payment_terms,
    i.sender_data,
    i.message,
    u."name",
    u.image_url,
    i.vat_sum,
    i.subtotal,
    i.total
    `
  );

  if (
    results !== undefined
    && results !== null
    && results.rows !== undefined
    && results.rows !== null
    && results.rows.length > 0
  ) {
    const attachmentResults = await knex.raw(
      `select
      filename
    from
      invoiceattachment
    where
      incoming_invoice_id = ${invoiceId}
    order by
      id
      `
    );
    results.rows[0].attachments = attachmentResults.rows;
  }
  return results.rows;
};

InvoiceWorkflowModel.getInvoiceWorkflow = async function (
  accountId,
  invoiceId
) {
  const response = await this.getQueryBuilder()
    .where('invoice_workflow.invoice', invoiceId)
    .where('invoice_workflow.supplier', accountId)
    .select()
    .first();

  return response;
};

InvoiceWorkflowModel.getInvoiceTotalAmount = async (accountId, invoiceId) => {
  // get the invoice total amount
  const invoiceTotal = await InvoiceWorkflowModel.getQueryBuilder()
    .select('incominginvoice.total')
    .where('invoice_workflow.invoice', invoiceId)
    .where('invoice_workflow.supplier', accountId)
    .innerJoin(
      'incominginvoice',
      'invoice_workflow.invoice',
      '=',
      'incominginvoice.id'
    );

  if (invoiceTotal.length <= 0) {
    throw new ApplicationError({
      message: 'No invoice available for the given invoiceID',
      statusCode: 404,
    });
  }

  return invoiceTotal[0].total;
};

InvoiceWorkflowModel.getInvoicesByRoleStatusAssignedTo = async (
  workflowRole,
  status,
  assignedTo
) => {
  const result = await InvoiceWorkflowModel.getQueryBuilder()
    .select('invoice_workflow.invoice')
    .where('invoice_workflow.status', status)
    .where('invoice_workflow.workflow_role', workflowRole)
    .where('invoice_workflow.assigned_to', assignedTo);

  let invoiceIds = [];

  if (result && result.length > 0) {
    invoiceIds = result.map(({ invoice }) => invoice);
  }

  return invoiceIds;
};

InvoiceWorkflowModel.assignInvoicesToAUser = async (
  invoiceIds,
  userId,
  transaction
) => {
  const updateResult = await InvoiceWorkflowModel.getQueryBuilder()
    .whereIn('invoice_workflow.invoice', invoiceIds)
    .transacting(transaction)
    .update({
      assigned_to: userId,
      updatedAt: new Date(),
    });

  return updateResult;
};

InvoiceWorkflowModel.updateInvoiceUserStatusAndWFRole = async (
  invoiceIds,
  status,
  userId,
  workflowRole,
  transaction
) => {
  const updateResult = await InvoiceWorkflowModel.getQueryBuilder()
    .whereIn('invoice_workflow.invoice', invoiceIds)
    .transacting(transaction)
    .update({
      assigned_to: userId,
      status,
      workflow_role: workflowRole,
      updatedAt: new Date(),
    });

  return updateResult;
};

InvoiceWorkflowModel.getUnassignedInvoicesPreviouslyAssignedToTheUser = async (
  supplierId,
  fromUserId
) => {
  const results = await knex.raw(
    `SELECT
      iw.invoice,
      iw.assigned_to,
      iw.status,
      iw.supplier
    FROM
      invoice_workflow iw
      inner join invoice_workflow_history iwh on
      iwh.invoice = iw.invoice
    WHERE
      iw.supplier = ?
      and iw.status = ?
      and iw.assigned_to IS NULL
      and iw.workflow_role IS NULL
      and iwh.from_status = ?
      and iwh.to_status = ?
      and iwh.from_user = ?
      and iwh.to_user IS NULL
    GROUP BY
      iw.invoice,
      iw.assigned_to,
      iw.status,
      iw.supplier,
      iwh.invoice
      `,
    [
      supplierId,
      InvoiceWorkflowModel.STATUS.TO_ASSIGN,
      InvoiceWorkflowModel.STATUS.TO_APPROVE,
      InvoiceWorkflowModel.STATUS.TO_ASSIGN,
      fromUserId,
    ]
  );

  if (
    results !== undefined
    && results !== null
    && results.rows !== undefined
    && results.rows !== null
    && results.rows.length > 0
  ) {
    const invoiceIds = [...new Set(results.rows.map((row) => row.invoice))];

    return invoiceIds;
  }

  return [];
};

module.exports = InvoiceWorkflowModel;
