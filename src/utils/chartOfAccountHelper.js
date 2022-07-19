const fs = require('fs');
const ApplicationError = require('./ApplicationError');
const {
  chartOfAccountVatTyes: { input_eu: inputEU, output_eu: outputEU, input },
  vatExCodes: { VATEX_EU_AE },
} = require('../enums/accounting');
const {
  ChartOfAccount,
  PostingCategory,
  ChartOfAccountProcess,
  PostingVatRate,
  ExchangeRate,
} = require('../models');
const {
  chartOfAccountStatusEnums,
  mappingStatusEnums,
  allowedOperationsEnum,
  taxCategory,
} = require('../enums/accounting');

const getFileSizeInMegabites = (file) => {
  const stats = fs.statSync(file.path);
  const fileSizeInMegabytes = stats.size / (1024 * 1024);

  return fileSizeInMegabytes;
};

const findAccountByType = async (
  supplierId,
  categoryCode,
  type = null,
  iteration = 0
) => {
  const query = ChartOfAccount.getQueryBuilder()
    .innerJoin(
      'posting_category',
      'posting_category.chart_of_account',
      'chart_of_account.id'
    )
    .where('posting_category.status', '=', mappingStatusEnums.published)
    .where('chart_of_account.status', '=', chartOfAccountStatusEnums.published)
    .where('posting_category.deleted', '=', false)
    .where('chart_of_account.deleted', '=', false)
    .where('chart_of_account.supplier', '=', supplierId)
    .whereRaw('posting_category.category_code like ?', [categoryCode])
    .first();

  if (!type) {
    query.whereNull('chart_of_account.vat_type');
  } else {
    query.where('chart_of_account.vat_type', '=', type);
  }

  const account = await query;
  if (!account && iteration < 3) {
    let code = categoryCode;
    const localIteration = iteration + 1;
    let trailingZeros = '';

    for (let i = 0; i <= iteration; i += 1) {
      trailingZeros += '00';
    }

    code = categoryCode.substring(0, categoryCode.length - 2 * localIteration);
    code += trailingZeros;

    return findAccountByType(supplierId, code, type, localIteration);
  }
  if (!account) {
    return null;
  }
  return account;
};

const getCategorizationStandard = () => 'unspsc';

const extractCategoryInfo = (category) => {
  const categoryJson = typeof category !== 'object' ? JSON.parse(category) : category;

  return categoryJson[getCategorizationStandard()];
};

// supplier's country decide how much percentage need to allocate
const findCountrySpecificVatAmount = async (country, itemTotal) => {
  const [{ percentage }] = await PostingVatRate.findVatPercentageByCountry(
    country,
    'percentage'
  );

  return itemTotal * percentage * 0.01;
};

/* eslint-disable camelcase */
const validateAndCreateDraft = async (account, supplierId, transaction) => {
  let existingAccount = null;
  if (account.operation !== allowedOperationsEnum.added) {
    existingAccount = await ChartOfAccount.getAccountById(
      account.reference,
      transaction
    );

    if (!existingAccount) {
      throw new ApplicationError({
        message: 'Account does not exist',
        statusCode: 400,
      });
    }

    if (existingAccount.supplier !== supplierId) {
      throw new ApplicationError({
        message: 'Account does not belong to the supplier',
        statusCode: 400,
      });
    }
  }

  if (account.operation === allowedOperationsEnum.added) {
    const withSameNumber = await ChartOfAccount.getAccountByAccountNumber(
      account.account_number,
      supplierId,
      transaction
    );
    if (withSameNumber && withSameNumber.length > 0) {
      throw new ApplicationError({
        message: 'Request contains duplicate draft account insertions',
        statusCode: 400,
      });
    }
  }

  const { vat_type: vatType = null } = account;

  let { deductibility } = account;

  if (!vatType) {
    if (!deductibility && deductibility !== 0) {
      deductibility = 100;
    }
  } else {
    deductibility = null;
  }

  const accountDraft = {
    supplier: supplierId,
    reference: existingAccount ? existingAccount.id : null,
    account_number: account.account_number,
    account_name: account.account_name,
    deductibility,
    vat_type: vatType,
    deleted: false,
    operation: account.operation,
    status: chartOfAccountStatusEnums.draft,
  };

  return accountDraft;
};
/* eslint-disable camelcase */

const addAccountDraft = async (account, supplierId, transaction) => {
  const draft = await validateAndCreateDraft(account, supplierId, transaction);
  return ChartOfAccount.insertAccount(draft, transaction);
};

const editAccountDraft = async (account, supplierId, transaction) => {
  const draft = await validateAndCreateDraft(account, supplierId, transaction);
  const existingDraft = await ChartOfAccount.getAccountDraftByReferenceId(
    account.reference,
    transaction
  );

  const existingAccount = await ChartOfAccount.getAccountById(
    account.reference,
    transaction
  );

  const currentDraft = existingAccount
    && existingAccount.status === chartOfAccountStatusEnums.draft
    ? existingAccount
    : existingDraft;

  if (currentDraft) {
    draft.operation = currentDraft.operation;
    if (currentDraft.operation === allowedOperationsEnum.deleted) {
      draft.operation = allowedOperationsEnum.edited;
    }
    draft.reference = currentDraft.reference;

    // delete mappings if the account change to VAT account
    if (draft.vat_type) {
      const toDeleteMappingCOA = currentDraft.reference
        ? currentDraft.reference
        : currentDraft.id;
      await PostingCategory.setToDelete(
        [toDeleteMappingCOA, currentDraft.id],
        transaction
      );
    }

    return ChartOfAccount.modifyAccount(currentDraft.id, draft, transaction);
  }
  const insertedAccount = await ChartOfAccount.insertAccount(
    draft,
    transaction
  );

  // update draft mappings belongs to that account
  await PostingCategory.modifyChartOfAccountByStatusAndAccount(
    draft.reference,
    insertedAccount[0],
    mappingStatusEnums.draft,
    transaction
  );

  // delete mappings if the account change to VAT account
  if (draft.vat_type) {
    const toDeleteMappingCOA = draft.reference
      ? draft.reference
      : insertedAccount[0];
    await PostingCategory.setToDelete([toDeleteMappingCOA], transaction);
  }

  return insertedAccount;
};

const deleteAccountDraft = async (account, supplierId, transaction) => {
  const existingAccount = await ChartOfAccount.getAccountById(
    account.reference,
    transaction
  );

  if (!existingAccount) {
    throw new ApplicationError({
      message: 'Account does not exist',
      statusCode: 400,
    });
  }

  let existingMappings = await PostingCategory.getExistingMappingsByCOA(
    existingAccount.id,
    transaction
  );

  // in case deleting a draft
  if (existingAccount.status === chartOfAccountStatusEnums.draft) {
    // categories are mapped to published chart of account (non draft) id
    if (existingAccount.reference) {
      existingMappings = await PostingCategory.getExistingMappingsByCOA(
        existingAccount.reference,
        transaction
      );
    }
    const deleteIds = [];
    existingMappings.forEach((mapping) => {
      if (mapping.status === mappingStatusEnums.draft) {
        deleteIds.push(mapping.id);
      }
    });

    if (deleteIds.length) {
      await PostingCategory.deleteMappingDrafts(deleteIds, transaction);
    }
    return ChartOfAccount.deleteAccountDraft(existingAccount.id, transaction);
  }

  // in case deleting an existing published account which may already has a draft
  const existingDraft = await ChartOfAccount.getAccountDraftByReferenceId(
    account.reference,
    transaction
  );

  // delete mappings
  const existingMappingDrafts = [];
  const publishedMappings = [];

  existingMappings.forEach((mapping) => {
    if (mapping === mappingStatusEnums.draft) {
      existingMappingDrafts.push(mapping.id);
    } else {
      const newMapping = {
        chart_of_account: mapping.chart_of_account,
        category_code: mapping.category_code,
        status: mappingStatusEnums.draft,
        deleted: true,
      };

      publishedMappings.push(newMapping);
    }
  });

  if (existingMappingDrafts) {
    await PostingCategory.updateMappingDrafts(
      existingMappingDrafts,
      { deleted: true },
      transaction
    );
  }

  if (publishedMappings) {
    await PostingCategory.insertMapping(publishedMappings, transaction);
  }

  // has an existing draft for the account, mappings are taken above
  if (existingDraft) {
    existingDraft.deleted = true;
    existingDraft.operation = allowedOperationsEnum.deleted;
    return ChartOfAccount.modifyAccount(
      existingDraft.id,
      existingDraft,
      transaction
    );
  }

  // create new draft, draft mappings have been posted above
  existingAccount.operation = allowedOperationsEnum.deleted;
  existingAccount.reference = account.reference;
  const draft = await validateAndCreateDraft(
    existingAccount,
    supplierId,
    transaction
  );

  draft.deleted = true;

  return ChartOfAccount.insertAccount(draft, transaction);
};

const saveDraft = async (accounts, supplierId, transaction) => {
  const promisesList = [];

  accounts.forEach((account) => {
    if (account.operation === allowedOperationsEnum.added) {
      promisesList.push(addAccountDraft(account, supplierId, transaction));
    } else if (account.operation === allowedOperationsEnum.edited) {
      promisesList.push(editAccountDraft(account, supplierId, transaction));
    } else if (account.operation === allowedOperationsEnum.deleted) {
      promisesList.push(deleteAccountDraft(account, supplierId, transaction));
    } else {
      throw new ApplicationError({
        message: 'Unknown Operation',
        statusCode: 400,
      });
    }
  });

  const results = await Promise.all(promisesList);
  results.forEach((result) => {
    if (!result || !result.length) {
      throw new ApplicationError({
        message: 'Error occured while saving draft.',
        statusCode: 422,
      });
    }
  });
};

/**
 * vat_summary column can contains multiple vat entries.
 * For reverse charge, vat_category = 'AE' should taken. In here VATEX might
 * not exists, and need to take the vat_category in that case
 *
 * @param {object} vatSummary
 * @returns vatExCode
 */
const findVatExPropertyFromSummary = (vatSummary) => {
  let vatExCode = '';
  const [{ tax_category = null, vatex = null } = []] = vatSummary.filter(
    (entry) => entry.tax_category === taxCategory.AE
  );

  if (vatex) {
    vatExCode = vatex;
  } else if (tax_category) {
    vatExCode = VATEX_EU_AE;
  }

  return vatExCode;
};

/**
 * Find VAT information for a given invoice line item
 *
 * @param {string} accountId
 * @param {object} invoiceItem
 * @param {object} invoice
 * @param {object} chartOfAccount
 * @returns
 */
const findVatInfo = async (accountId, invoiceItem, invoice, chartOfAccount) => {
  const {
    category,
    vat_amount_per_item: vatPerItem,
    quantity,
    price,
  } = invoiceItem;
  const [
    { sender_data: sender, receiver_data: receiver, vat_summary: vatSummary },
  ] = invoice;
  const lineItemTotal = quantity * price;
  const vatTotal = quantity * vatPerItem;
  let vatInfo = [];

  // check invoice has VAT or not,
  // if there is no VAT, then need to look for VATEX code from vat_summary column
  // Eg: vat_summary: [
  //     {
  //       "tax_category": "AE",
  //       "taxable_amount": 1160,
  //       "currency": "SEK",
  //       "tax_amount": 69.6,
  //       "percent": 6,
  //       "tax_scheme": "VAT",
  //       "vatex": "VATEX-EU-AE"
  //     }
  // ]

  // find invoice sender and receiver
  const { country: senderCountry } = sender || {};
  const { country: receiverCountry } = receiver || {};

  if (Number(vatPerItem) === 0) {
    // no VAT
    if (typeof vatSummary === 'object') {
      const vatex = findVatExPropertyFromSummary(vatSummary);

      // rule number 01
      if (vatex && vatex.toUpperCase() === VATEX_EU_AE) {
        const [
          inputEuVatAccountInfo,
          outputEuVatAccountInfo,
          vatAmount,
        ] = await Promise.all([
          ChartOfAccount.findCharOfAccountByVatType(accountId, inputEU, [
            'account_number',
            'account_name',
          ]),
          ChartOfAccount.findCharOfAccountByVatType(accountId, outputEU, [
            'account_number',
            'account_name',
          ]),
          findCountrySpecificVatAmount(senderCountry, lineItemTotal),
        ]);

        if (inputEuVatAccountInfo) {
          vatInfo.push({
            account_number: inputEuVatAccountInfo
              ? inputEuVatAccountInfo.account_number
              : null,
            account_name: inputEuVatAccountInfo
              ? inputEuVatAccountInfo.account_name
              : null,
            vat_amount: vatAmount,
            type: 'input_eu',
          });
        }

        if (outputEuVatAccountInfo) {
          vatInfo.push({
            account_number: outputEuVatAccountInfo
              ? outputEuVatAccountInfo.account_number
              : null,
            account_name: outputEuVatAccountInfo
              ? outputEuVatAccountInfo.account_name
              : null,
            vat_amount: -vatAmount,
            type: 'output_eu',
          });
        }
      }
    }
  } else if (senderCountry === receiverCountry) {
    // find a input VAT account
    const inputVatAccountInfo = await ChartOfAccount.findCharOfAccountByVatType(
      accountId,
      input,
      ['account_number', 'account_name']
    );

    if (inputVatAccountInfo) {
      // proceed only if input vat account can find
      const {
        account_number: inputVatAccount,
        account_name: accountName,
      } = inputVatAccountInfo;

      // find deductibility
      const lineItemCategory = extractCategoryInfo(category);

      if (lineItemCategory) {
        if (chartOfAccount) {
          const { deductibility } = chartOfAccount;
          const vatAmount = vatTotal * deductibility * 0.01;

          vatInfo = [
            {
              account_number: inputVatAccount,
              account_name: accountName,
              vat_amount: vatAmount,
              cost_amount: vatTotal - vatAmount,
              type: 'input',
              sender_country: senderCountry,
              receiver_country: receiverCountry,
            },
          ];
        }
      }
    }
  }

  return vatInfo;
};

const convertCurrency = async (
  amount,
  documentCurrency,
  localCurrency,
  date
) => {
  const document = amount;
  let local = 0;
  let system = 0;

  const dateInUtc = new Date(date.toUTCString());

  const [exchangeRates] = await ExchangeRate.getRatesByDate(dateInUtc);

  if (exchangeRates) {
    const { rates } = exchangeRates;

    // convert document currency to Euro
    const documentRate = rates[documentCurrency];
    const localRate = rates[localCurrency];

    system = +(amount / documentRate).toFixed(2);

    local = localCurrency === documentCurrency
      ? amount
      : +((localRate / documentRate) * amount).toFixed(2);
  }

  return {
    local,
    document,
    system,
  };
};

const saveDeleteMappings = async (
  category,
  existingAccounts,
  supplierId,
  transaction
) => {
  const {
    draft: draftStatus,
    published: publishedStatus,
  } = chartOfAccountStatusEnums;
  const mappingChartOfAccounts = [];
  let chartOfAccount = existingAccounts[0];

  if (existingAccounts.length > 1) {
    [chartOfAccount] = existingAccounts.filter(
      (account) => account.status === draftStatus
    );
    mappingChartOfAccounts.push(chartOfAccount.reference);
    mappingChartOfAccounts.push(chartOfAccount.id);
  } else if (chartOfAccount.reference) {
    mappingChartOfAccounts.push(chartOfAccount.reference);
    mappingChartOfAccounts.push(chartOfAccount.id);
  } else {
    mappingChartOfAccounts.push(chartOfAccount.id);
  }

  const categoryCode = category.code;

  let saveDeleteMappingsResult = '';
  if (category.operation === allowedOperationsEnum.added) {
    // check that we have added draft or added published category for that account
    const existingMapping = await PostingCategory.getMappingsBySupplierAndCategoryCode(
      supplierId,
      categoryCode,
      transaction
    );

    const existingDeleteddMapping = await PostingCategory.getMappingsBySupplierAndCategoryCode(
      supplierId,
      categoryCode,
      transaction,
      true
    );

    if (existingMapping.length > 0 && existingDeleteddMapping === 0) {
      throw new ApplicationError({
        message: 'Category mapping already exists',
        statusCode: 400,
      });
    }

    const mapppingDraft = {
      chart_of_account: Number(chartOfAccount.id),
      category_code: categoryCode,
      status: draftStatus,
    };
    const existingAllDraftMapping = await PostingCategory.getPostingCategoryByStatus(
      Number(chartOfAccount.id),
      categoryCode,
      draftStatus,
      transaction
    );
    if (existingAllDraftMapping.length > 0) {
      // check for already published mapping for that supplier
      const existingAllPublishedMapping = await PostingCategory.getPostingCategoryByStatus(
        Number(chartOfAccount.id),
        categoryCode,
        publishedStatus,
        transaction
      );

      /*
       * if there is published mappign removed the draft mapping, this is happens,
       * when some one trying to delete already published mapping and try to add it again
       */
      if (existingAllPublishedMapping.length > 0) {
        await PostingCategory.deleteMappingByStatus(
          Number(chartOfAccount.id),
          categoryCode,
          mappingStatusEnums.draft,
          transaction
        );
      } else {
        // if already deleted draft mapping is there, then it needs to edit the deleted draft
        saveDeleteMappingsResult = await PostingCategory.modifyDeleteStatusByAccountStatusAndSupplier(
          Number(chartOfAccount.id),
          draftStatus,
          false,
          transaction
        );
      }
    } else {
      // if no deleted draft mapping is there, then it needs to insert
      saveDeleteMappingsResult = await PostingCategory.insertMapping(
        mapppingDraft,
        transaction
      );
    }
  } else if (category.operation === allowedOperationsEnum.deleted) {
    /*
     * If there is published mapping, insert mapping with deleted status true
     * Else set to delete true in draft mappings relates to that account
     */
    const existingPublishedMapping = await PostingCategory.getPostingCategoryByStatus(
      chartOfAccount.reference
        ? chartOfAccount.reference
        : Number(chartOfAccount.id),
      categoryCode,
      publishedStatus,
      transaction
    );

    if (existingPublishedMapping.length > 0) {
      const mapppingDraft = {
        chart_of_account: Number(chartOfAccount.id),
        category_code: categoryCode,
        status: draftStatus,
        deleted: true,
      };

      saveDeleteMappingsResult = await PostingCategory.insertMapping(
        mapppingDraft,
        transaction
      );
    } else {
      await PostingCategory.deleteMappingByStatus(
        Number(chartOfAccount.id),
        categoryCode,
        mappingStatusEnums.draft,
        transaction
      );
    }
  }

  return saveDeleteMappingsResult;
};

const validateAndMappings = async (mapping, supplierId, transaction) => {
  const existingAccounts = await ChartOfAccount.getAccountByAccountNumberAndSupplier(
    mapping.account_number,
    supplierId,
    ['id', 'status', 'reference'],
    transaction
  );

  if (existingAccounts.length === 0) {
    throw new ApplicationError({
      message: 'Account does not exist',
      statusCode: 400,
    });
  }

  const { categories } = mapping;

  const categoryPromises = categories.map((category) => saveDeleteMappings(category, existingAccounts, supplierId, transaction));

  try {
    return Promise.all(categoryPromises);
  } catch (saveDeleteMappingError) {
    throw new ApplicationError({
      message: saveDeleteMappingError,
      statusCode: 422,
    });
  }
};

// check for duplicate mappings
const isMappingDuplicated = async (mappings) => {
  const allMappingsArray = [];
  mappings.forEach((mapping) => {
    mapping.categories.forEach((data) => {
      allMappingsArray.push(data);
    });
  });

  // duplicate mapping with same code and operation
  const keys = ['code', 'operation'];
  const filtered = allMappingsArray.filter(
    ((s) => (o) => ((k) => !s.has(k) && s.add(k))(keys.map((k) => o[k]).join('|')))(
      new Set()
    )
  );

  return filtered.length !== allMappingsArray.length;
};

const saveMappingsHelper = async (mappings, supplierId, type, transaction) => {
  const promisesList = mappings.map(async (mapping) => validateAndMappings(mapping, supplierId, transaction));

  try {
    await Promise.all(promisesList);
  } catch (error) {
    throw new ApplicationError({
      message: error,
      statusCode: 422,
    });
  }

  if (type === 'save_and_proceed') {
    const metaData = {
      accounts_saved: true,
      mappings_saved: true,
    };

    const entryId = await ChartOfAccountProcess.update(
      supplierId,
      metaData,
      transaction
    );

    if (!entryId) {
      throw new ApplicationError({
        message: 'Error occured while saving draft.',
        statusCode: 422,
      });
    }
  }
};

const validateAndPublishChartOfAccounts = async (
  account,
  supplierId,
  transaction
) => {
  const {
    operation,
    account_name: accountName,
    account_number: accountNumber,
    id,
    reference,
  } = account;
  const { edited, added, deleted } = allowedOperationsEnum;
  const { published, draft } = chartOfAccountStatusEnums;
  const { deductibility, vat_type: vatType = null } = account;

  if (deductibility && (deductibility < 0 || deductibility > 100)) {
    throw new ApplicationError({
      message: 'Deductibility must be between 0 and 100',
      statusCode: 400,
    });
  }

  const accountDraft = {
    supplier: supplierId,
    reference: null,
    account_number: accountNumber,
    account_name: accountName,
    deductibility,
    vat_type: vatType,
    deleted: false,
    status: published,
  };

  const publishedAccount = await ChartOfAccount.getAccountByStatusAndReference(
    reference,
    supplierId,
    published,
    'desc',
    transaction
  );

  if (operation === added) {
    // if there is a published account already has, we are not going to allow add it.
    if (publishedAccount.length > 0) {
      throw new ApplicationError({
        message: 'Account already exist',
        statusCode: 400,
      });
    }

    // make already added draft account  to published status
    await ChartOfAccount.modifyAccount(id, accountDraft, transaction);
  } else if (operation === edited) {
    // if published account not exist in this scenario means he have added new account and edited it.
    if (publishedAccount.length === 0) {
      await ChartOfAccount.modifyAccount(id, accountDraft, transaction);
    } else {
      // change published account with edited data
      await ChartOfAccount.modifyAccount(reference, accountDraft, transaction);

      // if published account has, then delete draft chart of account data
      const modifyPostingCategoryPromise = await PostingCategory.modifyAccount(
        id,
        reference,
        transaction
      );
      const deleteAccountBystatusPromise = await ChartOfAccount.deleteAccountByIdSupplierAndStatus(
        id,
        draft,
        supplierId,
        transaction
      );

      await Promise.all([
        deleteAccountBystatusPromise,
        modifyPostingCategoryPromise,
      ]);
    }
  } else if (operation === deleted) {
    // if published account not exist in this scenario means he have added new account and deleted it.
    if (publishedAccount.length === 0) {
      await PostingCategory.deleteMappingByAccountAndStatus(
        id,
        mappingStatusEnums.draft,
        transaction
      );
      await ChartOfAccount.deleteAccountByIdSupplierAndStatus(
        id,
        draft,
        supplierId,
        transaction
      );
    } else {
      accountDraft.deleted = true;

      await ChartOfAccount.modifyAccount(reference, accountDraft, transaction);

      const postingCategorySetToDeletePromise = await PostingCategory.setToDelete(
        [id, reference],
        transaction
      );
      const deleteDraftAccountPromise = await ChartOfAccount.deleteAccountByIdSupplierAndStatus(
        id,
        draft,
        supplierId,
        transaction
      );

      await Promise.all([
        postingCategorySetToDeletePromise,
        deleteDraftAccountPromise,
      ]);
    }
  } else {
    throw new ApplicationError({
      message: 'Unknown Operation',
      statusCode: 400,
    });
  }
};

const validateAndPublishMappings = async (account, supplierId, transaction) => {
  const {
    category_code: categoryCode,
    deleted,
    chart_of_account: chartOfAccount,
  } = account;
  const { published: publishedStatus } = mappingStatusEnums;

  if (deleted) {
    // delete draft mapping
    await PostingCategory.deleteMappingByStatus(
      chartOfAccount,
      categoryCode,
      mappingStatusEnums.draft,
      transaction
    );
    // set publish mapping to delete status
    await PostingCategory.setToDeleteMapppingByAccountAndStatus(
      chartOfAccount,
      categoryCode,
      publishedStatus,
      transaction
    );
  } else {
    const existingMapping = await PostingCategory.getActivePostingCategoryByStatus(
      chartOfAccount,
      supplierId,
      categoryCode,
      publishedStatus,
      ['chart_of_account.id'],
      transaction
    );

    if (existingMapping.length > 0) {
      throw new ApplicationError({
        message: 'Category mapping already exists',
        statusCode: 400,
      });
    }

    // set draft category mapppings to publish status
    await PostingCategory.modifyMapppingStatusByAccount(
      chartOfAccount,
      publishedStatus,
      transaction
    );
  }
};

const publishMappingsHelper = async (supplierId, transaction) => {
  const { draft } = chartOfAccountStatusEnums;

  // get draft ChartOfAccounts
  const draftAccounts = await ChartOfAccount.getAccountsBySupplierAndStatus(
    supplierId,
    draft,
    'desc',
    transaction
  );

  const promisesList = [];
  // publish chart of accounts
  draftAccounts.forEach((account) => {
    promisesList.push(
      validateAndPublishChartOfAccounts(account, supplierId, transaction)
    );
  });

  try {
    await Promise.all(promisesList);
  } catch (error) {
    console.log(`publishChartOfAccounts - ${supplierId} - ${error}`);

    throw new ApplicationError({
      message: error,
      statusCode: 422,
    });
  }
  // get draft mappings
  const draftMappings = await PostingCategory.getMappingsByStatus(
    supplierId,
    draft,
    'desc',
    transaction
  );

  const mappingsPromisesList = [];

  // publish mappings
  draftMappings.forEach((account) => {
    mappingsPromisesList.push(
      validateAndPublishMappings(account, supplierId, transaction)
    );
  });

  try {
    await Promise.all(mappingsPromisesList);
  } catch (error) {
    console.log(`publishMappings - ${supplierId} - ${error}`);

    throw new ApplicationError({
      message: error,
      statusCode: 422,
    });
  }

  const metaData = {
    accounts_saved: false,
    mappings_saved: false,
  };

  const entryId = await ChartOfAccountProcess.update(
    supplierId,
    metaData,
    transaction
  );

  if (!entryId) {
    throw new ApplicationError({
      message: 'Error occured while publishing draft.',
      statusCode: 422,
    });
  }
};

module.exports = {
  findAccountByType,
  findVatInfo,
  extractCategoryInfo,
  convertCurrency,
  saveMappingsHelper,
  getFileSizeInMegabites,
  publishMappingsHelper,
  saveDraft,
  isMappingDuplicated,
  findVatExPropertyFromSummary,
};
