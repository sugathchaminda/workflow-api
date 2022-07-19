const AWS = require('aws-sdk');
const xlsx = require('node-xlsx');
const uuid = require('uuid');

AWS.config.update({
  region: process.env.CW_REGION,
});

const knex = require('../../db');
const { parseAccountId } = require('../../utils/parseHelper');
const errorHelper = require('../../utils/errorHelper');
const ApplicationError = require('../../utils/ApplicationError');
const {
  ChartOfAccount,
  BatchProcessStatus,
  ChartOfAccountProcess,
  PostingCategory,
  IncomingInvoiceItem,
  IncomingInvoice,
  PostingInvoiceItem,
  Supplier,
} = require('../../models');
const chartOfAccountHelper = require('../../utils/chartOfAccountHelper');
const {
  chartOfAccountStatusEnums,
  mappingStatusEnums,
  batchProcessStatusEnum,
  batchProcessContextEnum,
} = require('../../enums/accounting');

const {
  findAccountByType,
  extractCategoryInfo,
  findVatInfo,
  publishMappingsHelper,
  saveMappingsHelper,
  convertCurrency,
  isMappingDuplicated,
} = require('../../utils/chartOfAccountHelper');

/**
 *
 * Generate presigned url for chart of accounts upload
 * @returns
 */
const uploadChartOfAccountSignedUrl = async (attributes) => {
  const accountId = parseAccountId(attributes.accountId);

  const currentChartOfAccounts = await ChartOfAccount.getAccountsBySupplier(
    accountId
  );

  if (currentChartOfAccounts.length > 0) {
    throw new ApplicationError({
      message: 'Chart Of Accounts already uploaded',
      statusCode: 422,
      status: 'error',
    });
  }

  const s3InitializeParams = {
    apiVersion: '2006-03-01',
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
  };

  if (process.env.LAMBDA_STAGE === 'dev') {
    s3InitializeParams.endpoint = 'http://localhost:4566';
  }
  const s3 = new AWS.S3(s3InitializeParams);

  const params = {
    Bucket: `${process.env.CHART_OF_ACCOUNT_UPLOAD_BUCKET_NAME}/${accountId}`,
    Key: uuid.v4(),
    Expires: 300,
  };

  let url = null;

  try {
    url = await s3.getSignedUrlPromise('putObject', params);

    // Initialize batch process status
    await BatchProcessStatus.create(accountId, batchProcessStatusEnum.started);
  } catch (err) {
    throw new ApplicationError({
      message: err.message,
      statusCode: err.statusCode,
    });
  }

  return {
    statusCode: 200,
    message: 'Chart Of Account upload URL generated successfully',
    data: { url: JSON.stringify(url) },
  };
};

/**
 *
 * Upload Chart Of Accounts Landing page info
 * @returns
 */
const getLandingPageInfo = async (attributes) => {
  const accountId = parseAccountId(attributes.accountId);
  const {
    draft: coaDraftStatus,
    published: coaPublishedStatus,
  } = chartOfAccountStatusEnums;
  const {
    draft: mappingDraftStatus,
    published: mappingPublishedStatus,
  } = mappingStatusEnums;

  // if supplier has at least one 'draft' from either chart of account or
  // mapping then user should direct to draf view
  const [
    chartOfAccountDrafts,
    chartOfAccountPublished,
    mappingDrafts,
    mappingPublished,
    processEntry,
  ] = await Promise.all([
    ChartOfAccount.getAccountsByStatus(accountId, coaDraftStatus),
    ChartOfAccount.getAccountsByStatus(accountId, coaPublishedStatus),
    PostingCategory.getMappingsByStatus(accountId, mappingDraftStatus),
    PostingCategory.getMappingsByStatus(accountId, mappingPublishedStatus),
    ChartOfAccountProcess.getAccountProcessEntryBySupplier(accountId),
  ]);

  // get COA last published date
  const output = {
    has_coa_drafts: chartOfAccountDrafts.length > 0 || false,
    has_coa_published: chartOfAccountPublished.length > 0 || false,
    last_coa_published_at: chartOfAccountPublished[0]
      ? chartOfAccountPublished[0].updatedAt
      : null,
    has_mapping_drafts: mappingDrafts.length > 0 || false,
    has_mapping_published: mappingPublished.length > 0 || false,
    last_mapping_published_at: mappingPublished[0]
      ? mappingPublished[0].updatedAt
      : null,
    can_publish: !!(
      processEntry
      && processEntry.meta_data
      && processEntry.meta_data.accounts_saved
      && processEntry.meta_data.mappings_saved
    ),
  };

  return output;
};

/**
 *
 * Process chart of accounts with SQS events
 * @returns
 */
const processChartOfAccounts = async (event) => {
  const s3InitializeParams = {
    s3ForcePathStyle: true,
  };
  if (process.env.LAMBDA_STAGE === 'dev') {
    s3InitializeParams.endpoint = `http://${process.env.LOCALSTACK_HOSTNAME}:4566`;
  }
  const s3 = new AWS.S3(s3InitializeParams);

  let s3Event = event.Records[0].body;

  if (typeof s3Event === 'string') {
    s3Event = JSON.parse(s3Event);
  }
  if (s3Event.s3) {
    s3Event.S3 = s3Event.s3;
  }

  s3Event.S3 = {};
  s3Event.S3.bucket = s3Event.Records[0].s3.bucket.name;
  s3Event.S3.key = s3Event.Records[0].s3.object.key;

  const s3Params = {
    Bucket: s3Event.S3.bucket,
    Key: s3Event.S3.key,
  };

  const supplierId = s3Event.S3.key.split('/')[0];

  // Initialize batch process status
  await BatchProcessStatus.create(supplierId, batchProcessStatusEnum.started);

  const transaction = await knex.transaction();

  try {
    const data = await s3.getObject(s3Params).promise();

    const bufferData = Buffer.from(data.Body);
    const workbook = await xlsx.parse(bufferData);
    const rowsToBeProcessed = workbook[0].data;

    rowsToBeProcessed.shift();

    const insertedRecordsResponse = await ChartOfAccount.create(
      rowsToBeProcessed,
      supplierId,
      transaction
    );

    // Update batch process status to 'complete'
    await BatchProcessStatus.create(
      supplierId,
      batchProcessStatusEnum.completed
    );

    transaction.commit();

    return insertedRecordsResponse;
  } catch (err) {
    console.log(`Chart Of Account Upload - ${supplierId} - ${err}`);
    transaction.rollback();

    // Update batch process status to 'failed'
    await BatchProcessStatus.create(supplierId, batchProcessStatusEnum.failed);

    throw new ApplicationError({
      message: `Error getting object
      ${s3Params.Key} from bucket ${s3Params.Bucket}. Make sure they exist and your bucket is in the same region as this function.`,
      statusCode: 500,
    });
  }
};

const getChartOfAccounts = async (attributes) => {
  const supplierId = parseAccountId(attributes.accountId);

  const uploadProcess = await BatchProcessStatus.GetBatchProcess(
    supplierId,
    batchProcessContextEnum.chart_of_accounts
  );
  if (uploadProcess) {
    if (uploadProcess.status === batchProcessStatusEnum.completed) {
      let accountPromise;

      if (attributes.type === 'mappings') {
        accountPromise = ChartOfAccount.getActiveChartOfAccountsBySupplier(
          supplierId,
          false
        );
      } else {
        accountPromise = ChartOfAccount.getActiveChartOfAccountsBySupplier(
          supplierId
        );
      }

      const promiseResult = await Promise.allSettled([
        accountPromise,
        ChartOfAccount.getLastPublishedDate(supplierId),
        ChartOfAccount.getLastUpdatedDate(supplierId),
        ChartOfAccount.getDraftAccounts(supplierId),
      ]);
      const [
        { value: accounts = [] },
        { value: lastPublished = null },
        { value: lastModified = null },
        { value: draftAccounts = [] },
      ] = promiseResult;

      const response = {
        accounts: accounts.map((acc) => ({
          account_id: acc.account_id,
          reference: acc.reference,
          supplier: acc.supplier,
          account_number: acc.account_number,
          account_name: acc.account_name,
          deductibility:
            acc.deductibility || acc.deductibility === 0
              ? acc.deductibility
              : null,
          vat_type: acc.vat_type,
          status: acc.status,
          operation: acc.operation,
          is_mapped_to_category: acc.is_mapped_to_category,
        })),
        details: {
          lastPublishedDate:
            lastPublished && lastPublished.createdAt
              ? lastPublished.createdAt
              : null,
          lastModifiedDate:
            lastModified && lastModified.createdAt
              ? lastModified.createdAt
              : null,
          publishedCount: accounts.filter(
            (acc) => acc.status === chartOfAccountStatusEnums.published
          ).length,
          draftsCount: draftAccounts.length,
        },
      };
      return response;
    }
    if (uploadProcess.status === batchProcessStatusEnum.started) {
      return {
        message: 'PROCESSING_UPLOAD',
      };
    }
    return errorHelper({
      message: 'Account upload has failed',
      statusCode: 422,
    }).payload;
  }
  return errorHelper({
    message: 'Account upload has not initiated.',
    statusCode: 422,
  }).payload;
};

const saveAccountsDraft = async (attributes) => {
  const supplierId = parseAccountId(attributes.accountId);
  const { accounts } = attributes;

  const transaction = await knex.transaction();

  try {
    await chartOfAccountHelper.saveDraft(accounts, supplierId, transaction);

    let accountProcessEntry = await ChartOfAccountProcess.getAccountProcessEntryBySupplier(
      supplierId,
      transaction
    );

    if (!accountProcessEntry || !accountProcessEntry.meta_data) {
      accountProcessEntry = {
        supplier: supplierId,
        meta_data: {
          accounts_saved: false,
          mappings_saved: false,
        },
      };
    } else {
      accountProcessEntry.meta_data.accounts_saved = false;
      accountProcessEntry.meta_data.mappings_saved = false;
    }

    if (attributes.type === 'save_and_proceed') {
      accountProcessEntry.meta_data.accounts_saved = true;
    }

    const entryId = await ChartOfAccountProcess.saveAccountProcessEntry(
      accountProcessEntry,
      transaction
    );

    if (!entryId) {
      throw new ApplicationError({
        message: 'Error occured while saving draft.',
        statusCode: 422,
      });
    }

    await transaction.commit();

    return {
      message: 'Successfully saved draft.',
    };
  } catch (error) {
    console.log(error);
    transaction.rollback();
    if (
      error.constraint
      === 'chart_of_account_supplier_account_number_status_unique'
    ) {
      return errorHelper({
        message: 'Request contains duplicate draft account insertions',
        statusCode: 400,
      }).payload;
    }
    return errorHelper({
      message: error.message ? error.message : error,
      statusCode: error.code ? error.code : 500,
    }).payload;
  }
};

const getChartOfAccountMappings = async (attributes) => {
  const supplierId = parseAccountId(attributes.accountId);

  try {
    const postingCategoryData = await ChartOfAccount.getPostingCategoriesBySupplier(
      supplierId
    );

    const mappingsData = [];
    postingCategoryData.forEach((postingCategory) => {
      const {
        reference,
        account_name: accountName,
        account_number: accountNumber,
        account_id: accountId,
        categories,
        status,
      } = postingCategory;

      const categoryArray = [];
      const deleteCategoryArray = [];
      if (status === mappingStatusEnums.draft || status === null) {
        categories.forEach((category) => {
          if (category.deleted) {
            deleteCategoryArray.push(category.code);
          } else {
            categoryArray.push({ code: category.code });
          }
        });

        const publishedDraftAccount = postingCategoryData.filter(
          (mappingData) => mappingData.account_number === accountNumber
            && mappingData.status === mappingStatusEnums.published
        );

        if (publishedDraftAccount.length > 0) {
          publishedDraftAccount[0].categories.forEach((category) => {
            if (
              !category.deleted
              && !deleteCategoryArray.includes(category.code)
            ) {
              categoryArray.push({ code: category.code });
            }
          });
        }
        if (reference) {
          const publishedReferencedAccount = postingCategoryData.filter(
            (mappingData) => mappingData.account_id === reference
              && mappingData.status === mappingStatusEnums.published
          );
          if (publishedReferencedAccount.length > 0) {
            publishedReferencedAccount[0].categories.forEach((category) => {
              if (
                !category.deleted
                && !deleteCategoryArray.includes(category.code)
              ) {
                categoryArray.push({ code: category.code });
              }
            });
          }
        }
        const mappingObject = {
          account_name: accountName,
          account_number: accountNumber,
          status,
          account_id: accountId,
          reference,
          categories: categoryArray,
        };
        mappingsData.push(mappingObject);
      } else {
        const publishedDraftAccount = postingCategoryData.filter(
          (mappingData) => mappingData.account_number === accountNumber
            && mappingData.status === mappingStatusEnums.draft
        );

        const draftReferenceAccount = postingCategoryData.filter(
          (mappingData) => mappingData.reference === accountId
            && (mappingData.status === mappingStatusEnums.draft
              || mappingData.status === null)
        );
        if (
          publishedDraftAccount.length === 0
          && draftReferenceAccount.length === 0
        ) {
          categories.forEach((category) => {
            if (!category.deleted) {
              categoryArray.push({ code: category.code });
            }
          });
          const mappingObject = {
            account_name: accountName,
            account_number: accountNumber,
            status,
            account_id: accountId,
            reference,
            categories: categoryArray,
          };
          mappingsData.push(mappingObject);
        }
      }
    });

    const [lastPublished, lastModified] = await Promise.all([
      PostingCategory.getLastPublishedDate(supplierId),
      PostingCategory.getLastUpdatedDate(supplierId),
    ]);

    const data = {
      mappings: mappingsData,
      details: {
        lastPublishedDate:
          lastPublished && lastPublished.createdAt
            ? lastPublished.createdAt
            : null,
        lastModifiedDate:
          lastModified && lastModified.createdAt
            ? lastModified.createdAt
            : null,
      },
    };

    return data;
  } catch (error) {
    console.log(error);

    return errorHelper({
      message: 'Get posting category data failed.',
      statusCode: 500,
    }).payload;
  }
};

/**
 * Auto posting service
 * @param {object} attributes
 * @returns simple response
 */
const autoPosting = async (attributes) => {
  const accountId = parseAccountId(attributes.accountId);
  const invoiceId = parseInt(attributes.invoiceId, 10);

  // validate the invoice is belongs to supplier
  const invoice = await IncomingInvoice.getInvoiceById(accountId, invoiceId, [
    'vat_sum',
    'sender_data',
    'receiver_data',
    'currency',
    'createdAt',
    'vat_summary',
  ]);

  if (invoice.length === 0) {
    throw new ApplicationError({
      message: 'No invoice found with this ID',
      statusCode: 404,
    });
  }

  const [{ currency: documentCurrency, createdAt: invoiceDate }] = invoice;

  // find supplier's country
  const { currency: localCurrency } = await Supplier.getSupplierById(
    accountId,
    ['currency']
  );

  // get invoice line items
  const invoiceItems = await IncomingInvoiceItem.getInvoiceItemsByInvoice(
    invoiceId
  );

  // validate all invoice line items are categorised
  let outputResult = {};
  const transaction = await knex.transaction();

  // loop through all the line items
  const postingEntriesPromiseArr = await invoiceItems.map(
    async (invoiceItem) => {
      // find a chart of account
      const {
        category,
        quantity,
        price,
        id: invoiceItemId,
        vat_amount_per_item: vatPerItem,
      } = invoiceItem;
      const { code: categoryCode } = extractCategoryInfo(category);
      const lineItemTotal = quantity * price;
      const vatTotal = quantity * vatPerItem;

      const chartOfAccount = await findAccountByType(accountId, categoryCode);

      if (!chartOfAccount) {
        throw new ApplicationError({
          message: `No Chart Of Account found for invoice item: ${invoiceItemId}`,
          statusCode: 422,
        });
      }

      // find a VAT information
      const vatInfo = await findVatInfo(
        accountId,
        invoiceItem,
        invoice,
        chartOfAccount
      );

      let postingDataEntry = {
        supplier: accountId,
        invoice: invoiceId,
        invoice_item: invoiceItemId,
      };

      // insert VAT entries to the posting
      vatInfo.forEach(async (vatEntry) => {
        const {
          account_number: accountNumber,
          vat_amount: amount,
          type,
          account_name: accountName,
        } = vatEntry || {};

        // currency conversion
        const {
          local: localAmount,
          system: systemAmount,
        } = await convertCurrency(
          amount,
          documentCurrency,
          localCurrency,
          invoiceDate
        );

        postingDataEntry = {
          ...postingDataEntry,
          account_number: accountNumber,
          account_name: accountName,
          account_type: type,
          amount_document: amount,
          amount_local: localAmount,
          amount_euro: systemAmount,
        };

        return PostingInvoiceItem.getQueryBuilder()
          .transacting(transaction)
          .insert(postingDataEntry);
      });

      // find a final cost amount for cost account and insert cost entry
      let costAmount = lineItemTotal;

      if (vatPerItem !== 0) {
        const [
          {
            sender_country: senderCountry = null,
            receiver_country: receiverCountry = null,
            cost_amount: costFromVat = 0,
            account_number: vatAccount = null,
          } = [],
        ] = vatInfo || {};

        if (senderCountry === receiverCountry) {
          costAmount += costFromVat;
        }

        // when no input VAT account found, Total + VAT => cost account
        if (!vatAccount) {
          costAmount += vatTotal;
        }
      }

      const {
        account_number: costAccountNumber,
        account_name: costAccountName,
        deductibility,
      } = chartOfAccount || {};

      // currency conversion
      const {
        local: localAmount,
        system: systemAmount,
      } = await convertCurrency(
        costAmount,
        documentCurrency,
        localCurrency,
        invoiceDate
      );

      postingDataEntry = {
        ...postingDataEntry,
        account_number: costAccountNumber,
        account_name: costAccountName,
        account_type: 'cost',
        amount_document: costAmount,
        amount_local: localAmount,
        amount_euro: systemAmount,
        deductibility,
      };

      return PostingInvoiceItem.getQueryBuilder()
        .transacting(transaction)
        .insert(postingDataEntry);
    }
  );

  try {
    if (postingEntriesPromiseArr.length > 0) {
      await Promise.all(postingEntriesPromiseArr);
      await transaction.commit();

      console.log(`Invoice ID: ${invoiceId} successfully posted`);

      outputResult = {
        message: 'Posting data added successfully',
        statusCode: 200,
      };
    } else {
      console.log(`Invoice ID: ${invoiceId} no items found to insert`);

      transaction.rollback();
      outputResult = {
        message: `Invoice ID: ${invoiceId} no items found to insert`,
        statusCode: 200,
      };
    }
  } catch (error) {
    console.log(
      `Error occured while Auto Posting for invoice ID: ${invoiceId}, supplier: ${accountId}`,
      error
    );
    transaction.rollback();
    outputResult = {
      message: `Error occured while Auto Posting for invoice ID: ${invoiceId}, supplier: ${accountId}`,
      statusCode: 500,
    };
  }

  return outputResult;
};

const saveMappings = async (attributes) => {
  const supplierId = parseAccountId(attributes.accountId);
  const { mappings, type } = attributes;
  const isMappingDuplicate = await isMappingDuplicated(mappings);

  if (isMappingDuplicate) {
    throw new ApplicationError({
      message: 'Duplicate mapping entries',
      statusCode: 422,
    });
  }

  const transaction = await knex.transaction();

  try {
    await saveMappingsHelper(mappings, supplierId, type, transaction);

    await transaction.commit();
    return {
      message: 'Successfully saved category mappings.',
    };
  } catch (error) {
    console.log(`saveCategoryMapping - ${supplierId} - ${error}`);
    transaction.rollback();
    return errorHelper({
      message: error.message ? error.message : error,
      statusCode: error.code ? error.code : 500,
    }).payload;
  }
};

const getPostingResults = async (attributes) => {
  const invoiceId = parseInt(attributes.invoiceId, 10);
  const data = await PostingInvoiceItem.getPostingResultsByInvoiceId(invoiceId);
  return {
    columns: ['account', 'description', 'amount'],
    data,
  };
};

const publishMappings = async (attributes) => {
  const supplierId = parseAccountId(attributes.accountId);

  const transaction = await knex.transaction();

  try {
    await publishMappingsHelper(supplierId, transaction);

    await transaction.commit();

    return {
      message: 'Chart of accounts and mappings published successfully.',
    };
  } catch (error) {
    console.log(`publishMappingsAndChartOfAccounts - ${supplierId} - ${error}`);

    transaction.rollback();

    return errorHelper({
      message: error.message ? error.message : error,
      statusCode: error.code ? error.code : 500,
    }).payload;
  }
};

module.exports = {
  processChartOfAccounts,
  getLandingPageInfo,
  getChartOfAccounts,
  saveAccountsDraft,
  getChartOfAccountMappings,
  autoPosting,
  publishMappings,
  saveMappings,
  getPostingResults,
  uploadChartOfAccountSignedUrl,
};
