/* eslint-disable func-names */
/* eslint-disable no-restricted-globals */
const Model = require('../model');

const PostingCategoryModel = new Model('posting_category');

const {
  mappingStatusEnums: { published, draft },
} = require('../enums/accounting');

PostingCategoryModel.getMappingsByStatus = async (
  supplier,
  status,
  order = 'desc',
  transaction = null
) => {
  let query = PostingCategoryModel.getQueryBuilder();

  if (transaction) {
    query = query.transacting(transaction);
  }
  const mappings = await query
    .leftJoin(
      'chart_of_account',
      'chart_of_account.id',
      'posting_category.chart_of_account'
    )
    .select([
      'posting_category.id',
      'posting_category.chart_of_account',
      'posting_category.category_code',
      'posting_category.status',
      'posting_category.deleted',
      'posting_category.updatedAt',
    ])
    .where('chart_of_account.supplier', supplier)
    .where('posting_category.status', status)
    .orderBy('posting_category.updatedAt', order);

  return mappings;
};

PostingCategoryModel.insertMapping = (mapping, transaction) => PostingCategoryModel.getQueryBuilder()
  .insert(mapping)
  .returning('id')
  .transacting(transaction);

PostingCategoryModel.getExistingMappingsByCOA = (coaId, transaction) => PostingCategoryModel.getQueryBuilder()
  .where('chart_of_account', '=', coaId)
  .transacting(transaction);

PostingCategoryModel.deleteMappingDrafts = (ids, transaction) => PostingCategoryModel.getQueryBuilder()
  .del()
  .whereIn('id', ids)
  .transacting(transaction);

PostingCategoryModel.deleteMappingByStatus = (
  chartOfAccount,
  categoryCode,
  status,
  transaction
) => PostingCategoryModel.getQueryBuilder()
  .where('chart_of_account', '=', chartOfAccount)
  .where('status', status)
  .andWhere('category_code', '=', categoryCode)
  .del()
  .transacting(transaction);

PostingCategoryModel.updateMappingDrafts = (ids, updates, transaction) => PostingCategoryModel.getQueryBuilder()
  .update(updates)
  .whereIn('id', ids)
  .transacting(transaction);

PostingCategoryModel.deleteMapping = (
  chartOfAccount,
  categoryCode,
  status,
  transaction
) => PostingCategoryModel.getQueryBuilder()
  .where('chart_of_account', chartOfAccount)
  .where('status', '=', status)
  .andWhere('category_code', '=', categoryCode)
  .del()
  .transacting(transaction);

PostingCategoryModel.deleteMappingByAccountAndStatus = (
  chartOfAccount,
  status,
  transaction
) => PostingCategoryModel.getQueryBuilder()
  .where('chart_of_account', '=', chartOfAccount)
  .where('status', '=', status)
  .del()
  .transacting(transaction);

PostingCategoryModel.getPostingCategoryByStatus = async (
  accountId,
  categoryCode,
  mappingStatus,
  transaction
) => {
  let query = PostingCategoryModel.getQueryBuilder();

  if (transaction) {
    query = query.transacting(transaction);
  }

  const response = await query
    .where('chart_of_account', '=', accountId)
    .andWhere('category_code', '=', categoryCode)
    .andWhere('status', '=', mappingStatus)
    .select('id');

  return response;
};

PostingCategoryModel.getActivePostingCategoryByStatus = (
  accountId,
  supplier,
  categoryCode,
  mappingStatus,
  select = ['*'],
  transaction
) => {
  let query = PostingCategoryModel.getQueryBuilder();

  if (transaction) {
    query = query.transacting(transaction);
  }

  return query
    .leftJoin(
      'chart_of_account',
      'chart_of_account.id',
      'posting_category.chart_of_account'
    )
    .where('posting_category.chart_of_account', '=', accountId)
    .andWhere('posting_category.category_code', '=', categoryCode)
    .where('chart_of_account.supplier', supplier)
    .andWhere('posting_category.deleted', '=', false)
    .andWhere('posting_category.status', '=', mappingStatus)
    .select(select);
};

PostingCategoryModel.getMappingsBySupplierAndCategoryCode = async (
  supplier,
  categoryCode,
  transaction = null,
  deleted = false
) => {
  let query = PostingCategoryModel.getQueryBuilder();

  if (transaction) {
    query = query.transacting(transaction);
  }
  const mappings = await query
    .leftJoin(
      'chart_of_account',
      'chart_of_account.id',
      'posting_category.chart_of_account'
    )
    .select(['posting_category.id'])
    .where('chart_of_account.supplier', supplier)
    .where('posting_category.deleted', deleted)
    .where('posting_category.category_code', categoryCode);

  return mappings;
};

PostingCategoryModel.modifyAccount = (
  accountId,
  updatedAccountId,
  transaction
) => PostingCategoryModel.getQueryBuilder()
  .update({ chart_of_account: updatedAccountId })
  .where('chart_of_account', '=', accountId)
  .returning('id')
  .transacting(transaction);

PostingCategoryModel.setToDelete = (accountIds, transaction) => PostingCategoryModel.getQueryBuilder()
  .update({ deleted: true })
  .whereIn('chart_of_account', accountIds)
  .returning('id')
  .transacting(transaction);

PostingCategoryModel.setToDeleteMapppingByCategoryAndAccountAndStatus = (
  account,
  categoryCode,
  status,
  transaction
) => PostingCategoryModel.getQueryBuilder()
  .update({ deleted: true })
  .where('chart_of_account', '=', account)
  .where('category_code', '=', categoryCode)
  .where('status', '=', status)
  .returning('id')
  .transacting(transaction);

PostingCategoryModel.setToDeleteMapppingByAccountAndStatus = (
  accountId,
  categoryCode,
  status,
  transaction
) => PostingCategoryModel.getQueryBuilder()
  .update({ deleted: true })
  .where('chart_of_account', '=', accountId)
  .where('category_code', '=', categoryCode)
  .where('status', '=', status)
  .returning('id')
  .transacting(transaction);

PostingCategoryModel.modifyMapppingStatusByAccount = (
  accountId,
  status,
  transaction
) => PostingCategoryModel.getQueryBuilder()
  .update({ status })
  .where('chart_of_account', '=', accountId)
  .returning('id')
  .transacting(transaction);

PostingCategoryModel.modifyChartOfAccountByStatusByAccount = (
  accountId,
  status,
  transaction
) => PostingCategoryModel.getQueryBuilder()
  .update({ chart_of_account: accountId })
  .where('status', '=', status)
  .returning('id')
  .transacting(transaction);

PostingCategoryModel.modifyChartOfAccountByStatusAndAccount = (
  currentAccountId,
  toAccountId,
  status,
  transaction
) => PostingCategoryModel.getQueryBuilder()
  .update({ chart_of_account: toAccountId })
  .where('status', '=', status)
  .where('chart_of_account', '=', currentAccountId)
  .returning('id')
  .transacting(transaction);

PostingCategoryModel.modifyDeleteStatusByAccountStatusAndSupplier = (
  accountId,
  status,
  deleteStatus,
  transaction
) => PostingCategoryModel.getQueryBuilder()
  .update({ deleted: deleteStatus })
  .where('chart_of_account', '=', accountId)
  .where('status', '=', status)
  .returning('id')
  .transacting(transaction);

PostingCategoryModel.getLastPublishedDate = (supplierId) => PostingCategoryModel.getQueryBuilder()
  .leftJoin(
    'chart_of_account',
    'chart_of_account.id',
    'posting_category.chart_of_account'
  )
  .where('chart_of_account.supplier', '=', supplierId)
  .andWhere('posting_category.status', '=', published)
  .orderBy('posting_category.createdAt', 'desc')
  .select('posting_category.createdAt')
  .first();

PostingCategoryModel.getLastUpdatedDate = (supplierId) => PostingCategoryModel.getQueryBuilder()
  .leftJoin(
    'chart_of_account',
    'chart_of_account.id',
    'posting_category.chart_of_account'
  )
  .where('chart_of_account.supplier', '=', supplierId)
  .andWhere('posting_category.status', '=', draft)
  .orderBy('posting_category.createdAt', 'desc')
  .select('posting_category.createdAt')
  .first();

module.exports = PostingCategoryModel;
