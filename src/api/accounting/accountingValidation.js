const { clean, validate } = require('../../utils/validationHelper');
const {
  uploadChartOfAccountSignedUrl: uploadChartOfAccountSignedUrlSchema,
  getLandingPageInfo: getLandingPageInfoSchema,
  getChartOfAccounts: getChartOfAccountsSchema,
  saveAccountsDraft: saveAccountsDraftSchema,
  getChartOfAccountMappings: getChartOfAccountMappingsSchema,
  autoPosting: autoPostingSchema,
  publishMappings: publishMappingsSchema,
  saveMappings: saveMappingsSchema,
  getPostingResults: getPostingResultsSchema,
} = require('./accountingSchema');

const uploadChartOfAccountSignedUrlValidation = async (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
  });

  return validate(attributes, uploadChartOfAccountSignedUrlSchema);
};

const getLandingPageInfoValidation = async (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
  });

  return validate(attributes, getLandingPageInfoSchema);
};

const getChartOfAccountsValidation = async (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    type: req.params.type,
  });

  return validate(attributes, getChartOfAccountsSchema);
};

const saveAccountsDraftValidation = async (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    type: req.params.type,
    accounts: req.body.accounts,
  });

  return validate(attributes, saveAccountsDraftSchema);
};

const getChartOfAccountMappingsValidation = async (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
  });

  return validate(attributes, getChartOfAccountMappingsSchema);
};

const autoPostingValidation = async (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    invoiceId: req.params.invoiceId,
  });

  return validate(attributes, autoPostingSchema);
};

const publishMappingsValidation = async (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
  });

  return validate(attributes, publishMappingsSchema);
};

const saveMappingsValidation = async (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    type: req.params.type,
    mappings: req.body ? req.body.mappings : null,
  });

  return validate(attributes, saveMappingsSchema);
};

const getPostingResultsValidation = async (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    invoiceId: req.params.invoiceId,
  });

  return validate(attributes, getPostingResultsSchema);
};

module.exports = {
  uploadChartOfAccountSignedUrlValidation,
  getLandingPageInfoValidation,
  getChartOfAccountsValidation,
  saveAccountsDraftValidation,
  getChartOfAccountMappingsValidation,
  autoPostingValidation,
  publishMappingsValidation,
  saveMappingsValidation,
  getPostingResultsValidation,
};
