/* eslint-disable func-names */
/* eslint-disable no-restricted-globals */
const Model = require('../model');
const {
  chartOfAccountStatusEnums,
  allowedOperationsEnum,
  mappingStatusEnums,
} = require('../enums/accounting');
const knex = require('../db');

const ChartOfAccountModel = new Model('chart_of_account as chart_of_account');

ChartOfAccountModel.create = async (rows, supplierId, transaction = null) => {
  const mappedDataRecords = rows.map((data) => ({
    account_number: data[0],
    account_name: data[1],
    deductibility: data[2] ? Number(data[2]) : 0,
    status: chartOfAccountStatusEnums.draft,
    supplier: supplierId,
    operation: allowedOperationsEnum.added,
  }));

  let query = ChartOfAccountModel.getQueryBuilder();

  if (transaction) {
    query = query.transacting(transaction);
  }

  const response = await query
    .insert(mappedDataRecords)
    .returning(['account_number', 'account_name']);

  return response;
};

ChartOfAccountModel.getAccountsByStatus = async (
  supplier,
  status,
  order = 'desc',
  transaction = null
) => {
  let query = ChartOfAccountModel.getQueryBuilder();

  if (transaction) {
    query = query.transacting(transaction);
  }

  const chartOfAccounts = await query
    .where('supplier', supplier)
    .where('status', status)
    .where('deleted', false)
    .orderBy('updatedAt', order)
    .select('*');

  return chartOfAccounts;
};

ChartOfAccountModel.getAccountsBySupplierAndStatus = async (
  supplier,
  status,
  order = 'desc',
  transaction = null
) => {
  let query = ChartOfAccountModel.getQueryBuilder();

  if (transaction) {
    query = query.transacting(transaction);
  }

  const chartOfAccounts = await query
    .where('supplier', supplier)
    .where('status', status)
    .orderBy('updatedAt', order)
    .select('*');

  return chartOfAccounts;
};

ChartOfAccountModel.getAccountByStatusAndReference = async (
  reference,
  supplier,
  status,
  order = 'desc',
  transaction = null
) => {
  let query = ChartOfAccountModel.getQueryBuilder();

  if (transaction) {
    query = query.transacting(transaction);
  }

  const chartOfAccounts = await query
    .where('id', reference)
    .where('supplier', supplier)
    .where('status', status)
    .where('deleted', false)
    .orderBy('updatedAt', order)
    .select('*');

  return chartOfAccounts;
};

ChartOfAccountModel.getActiveChartOfAccountsBySupplier = async (
  supplierId,
  includeVatAccounts = true
) => {
  const result = await knex.raw(
    `
      SELECT 
        ca.id AS account_id,
        ca.reference,
        ca.supplier,
        ca.account_name,
        ca.account_number,
        ca.deductibility,
        ca.vat_type,
        ca.status,
        ca.operation,
        (
          SELECT COUNT(*) > 0
          FROM posting_category 
          WHERE posting_category.chart_of_account = ca.id
          AND posting_category.deleted = false
        ) AS is_mapped_to_category
      FROM chart_of_account AS ca
      WHERE 
      ca.supplier = ?
        AND ca.id NOT IN ( 
          SELECT coa.reference FROM chart_of_account AS coa
          WHERE coa.supplier = ?
          AND coa.status = ?
          AND coa.reference IS NOT NULL
        )
        AND ca.deleted = false
        AND (ca.operation <> ? OR ca.operation IS NULL)
        AND (? OR ca.vat_type IS NULL)
      ORDER BY ca.account_number
    `,
    [
      supplierId,
      supplierId,
      mappingStatusEnums.draft,
      allowedOperationsEnum.deleted,
      includeVatAccounts,
    ]
  );

  return result.rows;
};

ChartOfAccountModel.getLastPublishedDate = (supplierId) => ChartOfAccountModel.getQueryBuilder()
  .where('supplier', '=', supplierId)
  .andWhere('status', '=', chartOfAccountStatusEnums.published)
  .orderBy('createdAt', 'desc')
  .select('createdAt')
  .first();

ChartOfAccountModel.getLastUpdatedDate = (supplierId) => ChartOfAccountModel.getQueryBuilder()
  .where('supplier', '=', supplierId)
  .andWhere('status', '=', chartOfAccountStatusEnums.draft)
  .orderBy('createdAt', 'desc')
  .select('createdAt')
  .first();

ChartOfAccountModel.findCharOfAccountByVatType = (
  supplierId,
  type,
  select = ['*']
) => ChartOfAccountModel.getQueryBuilder()
  .where('supplier', '=', supplierId)
  .where('status', 'published')
  .where('deleted', false)
  .where('vat_type', '=', type)
  .select(select)
  .first();

ChartOfAccountModel.getAccountByAccountNumberAndSupplier = async (
  accountNumber,
  supplierId,
  select = ['*'],
  transaction = null
) => {
  let query = ChartOfAccountModel.getQueryBuilder();

  if (transaction) {
    query = query.transacting(transaction);
  }

  const response = await query
    .where('account_number', accountNumber)
    .where('supplier', supplierId)
    .where('deleted', false)
    .select(select);

  return response;
};

ChartOfAccountModel.getDraftAccounts = (supplierId, select = ['*']) => {
  const query = ChartOfAccountModel.getQueryBuilder();
  return query
    .where('supplier', supplierId)
    .where('status', chartOfAccountStatusEnums.draft)
    .select(select);
};

ChartOfAccountModel.insertAccount = (account, transaction) => ChartOfAccountModel.getQueryBuilder()
  .insert(account)
  .returning('id')
  .transacting(transaction);

ChartOfAccountModel.modifyAccount = (accountId, account, transaction) => ChartOfAccountModel.getQueryBuilder()
  .update(account)
  .where('id', '=', accountId)
  .returning('id')
  .transacting(transaction);

ChartOfAccountModel.getAccountById = (accountId, transaction) => {
  const query = ChartOfAccountModel.getQueryBuilder()
    .where('id', '=', accountId)
    .first();

  if (transaction) {
    query.transacting(transaction);
  }
  return query;
};

ChartOfAccountModel.getAccountDraftByReferenceId = (reference, transaction) => {
  const query = ChartOfAccountModel.getQueryBuilder()
    .where('reference', '=', reference)
    .first();

  if (transaction) {
    query.transacting(transaction);
  }
  return query;
};

ChartOfAccountModel.getAccountByAccountNumber = (
  accountNumber,
  supplierId,
  transaction
) => {
  const query = ChartOfAccountModel.getQueryBuilder()
    .where('account_number', '=', accountNumber)
    .where('supplier', '=', supplierId)
    .where('deleted', '=', false);

  if (transaction) {
    query.transacting(transaction);
  }
  return query;
};

ChartOfAccountModel.deleteAccountDraft = (accountId, transaction) => ChartOfAccountModel.getQueryBuilder()
  .delete()
  .where('id', '=', accountId)
  .andWhere('status', '=', chartOfAccountStatusEnums.draft)
  .returning('id')
  .transacting(transaction);

ChartOfAccountModel.deleteAccountByStatusAndSupplier = (
  chartOfAccount,
  status,
  supplierId,
  transaction
) => ChartOfAccountModel.getQueryBuilder()
  .where('account_number', '=', chartOfAccount)
  .where('status', '=', status)
  .where('supplier', '=', supplierId)
  .del()
  .transacting(transaction);

ChartOfAccountModel.deleteAccountByIdSupplierAndStatus = (
  accountId,
  status,
  supplierId,
  transaction
) => ChartOfAccountModel.getQueryBuilder()
  .where('id', '=', accountId)
  .where('status', '=', status)
  .where('supplier', '=', supplierId)
  .del()
  .transacting(transaction);

ChartOfAccountModel.getPostingCategoriesBySupplier = async (supplierId) => {
  const results = await knex.raw(
    `SELECT ca.account_name, ca.account_number, pc.status, ca.status as coa_status, ca.id as account_id, ca.reference,
      COALESCE(json_agg((json_build_object('code', CAST(pc.category_code AS INT), 'deleted', pc.deleted))) 
      FILTER (WHERE pc.category_code IS NOT NULL), '[]') AS categories
    FROM chart_of_account ca 
    LEFT JOIN posting_category pc on ca.id = pc.chart_of_account 
    WHERE ca.supplier = ? AND ca.deleted = ?
    GROUP BY pc.status, ca.account_name, ca.account_number,  ca.id, ca.reference, ca.status
    ORDER BY ca.account_name ASC`,
    [supplierId, false]
  );
  return results.rows;
};

ChartOfAccountModel.getAccountsBySupplier = async (
  supplier,
  order = 'desc',
  transaction = null
) => {
  let query = ChartOfAccountModel.getQueryBuilder();

  if (transaction) {
    query = query.transacting(transaction);
  }

  const chartOfAccounts = await query
    .where('supplier', supplier)
    .where('deleted', false)
    .orderBy('updatedAt', order)
    .select('*');

  return chartOfAccounts;
};

module.exports = ChartOfAccountModel;
