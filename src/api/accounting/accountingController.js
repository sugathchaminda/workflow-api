const controller = require('../../controller');
const {
  getChartOfAccountsValidation,
  saveAccountsDraftValidation,
  uploadChartOfAccountSignedUrlValidation,
  getLandingPageInfoValidation,
  autoPostingValidation,
  saveMappingsValidation,
  getPostingResultsValidation,
  getChartOfAccountMappingsValidation,
  publishMappingsValidation,
} = require('./accountingValidation');

const {
  uploadChartOfAccountSignedUrl: uploadChartOfAccountSignedUrlService,
  processChartOfAccounts: processChartOfAccountsService,
  getLandingPageInfo: getLandingPageInfoService,
  getChartOfAccounts: getChartOfAccountsService,
  autoPosting: autoPostingService,
  saveMappings: saveMappingsService,
  getPostingResults: getPostingResultsService,
  saveAccountsDraft: saveAccountsDraftService,
  getChartOfAccountMappings: getChartOfAccountMappingsService,
  publishMappings: publishMappingsService,
} = require('./accountingService');

// functions invoke by tiggers
const processChartOfAccounts = async (event) => {
  await processChartOfAccountsService(event);
};

// functions invoke by APIs
const getSignedUrlForChartOfAccountsUpload = async (req, res) => {
  await controller(req, res, {
    validator: uploadChartOfAccountSignedUrlValidation,
    service: uploadChartOfAccountSignedUrlService,
  });
};

const getLandingPageInfo = async (req, res) => {
  await controller(req, res, {
    validator: getLandingPageInfoValidation,
    service: getLandingPageInfoService,
  });
};

const getChartOfAccounts = async (req, res) => {
  await controller(req, res, {
    validator: getChartOfAccountsValidation,
    service: getChartOfAccountsService,
  });
};

const autPosting = async (req, res) => {
  await controller(req, res, {
    validator: autoPostingValidation,
    service: autoPostingService,
  });
};

const saveMappings = async (req, res) => {
  await controller(req, res, {
    validator: saveMappingsValidation,
    service: saveMappingsService,
  });
};

const getPostingResults = async (req, res) => {
  await controller(req, res, {
    validator: getPostingResultsValidation,
    service: getPostingResultsService,
  });
};

const saveAccountsDraft = async (req, res) => {
  await controller(req, res, {
    validator: saveAccountsDraftValidation,
    service: saveAccountsDraftService,
  });
};

const getChartOfAccountMappings = async (req, res) => {
  await controller(req, res, {
    validator: getChartOfAccountMappingsValidation,
    service: getChartOfAccountMappingsService,
  });
};

const publishMappings = async (req, res) => {
  await controller(req, res, {
    validator: publishMappingsValidation,
    service: publishMappingsService,
  });
};

module.exports = {
  getSignedUrlForChartOfAccountsUpload,
  processChartOfAccounts,
  getLandingPageInfo,
  getChartOfAccounts,
  saveAccountsDraft,
  autPosting,
  saveMappings,
  getPostingResults,
  getChartOfAccountMappings,
  publishMappings,
};
