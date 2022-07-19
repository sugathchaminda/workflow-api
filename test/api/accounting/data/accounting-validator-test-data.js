const getLandingPageInfoValidatorReq = {
  params: {
    accountId: '1',
  },
};

const getLandingPageInfoValidatorRes = {
  accountId: '1',
};

const getChartOfAccountsValidatorReq = {
  params: {
    accountId: '1',
  },
};

const getChartOfAccountsValidatorRes = {
  accountId: '1',
};

const saveAccountsDraftValidatorReq = {
  params: {
    accountId: '1',
    type: 'save_draft',
  },
  body: {
    accounts: [
      {
        account_number: '1004',
        account_name: 'Account 4',
        deductibility: '80',
        vat_type: 'input',
        operation: 'added',
      },
      {
        account_number: '1000',
        account_name: 'Account 5',
        deductibility: '80',
        vat_type: 'input',
        reference: 3,
        operation: 'edited',
      },
      {
        reference: 4,
        operation: 'deleted',
      },
    ],
  },
};

const saveAccountsDraftValidatorRes = {
  accountId: '1',
  type: 'save_draft',
  accounts: [
    {
      account_number: '1004',
      account_name: 'Account 4',
      deductibility: '80',
      vat_type: 'input',
      operation: 'added',
    },
    {
      account_number: '1000',
      account_name: 'Account 5',
      deductibility: '80',
      vat_type: 'input',
      reference: 3,
      operation: 'edited',
    },
    {
      reference: 4,
      operation: 'deleted',
    },
  ],
};

const getChartOfAccountMappingsValidatorReq = {
  params: {
    accountId: '1',
  },
};

const getChartOfAccountMappingsValidatorRes = {
  accountId: '1',
};

const uploadChartOfAccountValidatorReq = {
  params: {
    accountId: '1',
  },
};

const uploadChartOfAccountValidatorRes = {
  accountId: '1',
};

const chartOfAccountSaveMappingsValidationReq = {
  params: {
    accountId: '1',
    type: 'save_and_proceed',
  },
  body: {
    mappings: [
      {
        account_number: '1001',
        categories: [
          { code: 23000000, operation: 'added' },
          { code: 27000000, operation: 'deleted' },
        ],
      },
    ],
  },
};

const chartOfAccountSaveMappingsValidationRes = {
  accountId: '1',
  type: 'save_and_proceed',
  mappings: [
    {
      account_number: '1001',
      categories: [
        { code: 23000000, operation: 'added' },
        { code: 27000000, operation: 'deleted' },
      ],
    },
  ],
};

const getPostingResultsValidatorReq = {
  params: {
    accountId: '1',
    invoiceId: '1',
  },
};

const getPostingResultsValidatorRes = {
  accountId: '1',
  invoiceId: '1',
};

module.exports = {
  getLandingPageInfoValidatorReq,
  getLandingPageInfoValidatorRes,
  uploadChartOfAccountValidatorReq,
  uploadChartOfAccountValidatorRes,
  getChartOfAccountsValidatorReq,
  getChartOfAccountsValidatorRes,
  saveAccountsDraftValidatorReq,
  saveAccountsDraftValidatorRes,
  getChartOfAccountMappingsValidatorReq,
  getChartOfAccountMappingsValidatorRes,
  chartOfAccountSaveMappingsValidationReq,
  chartOfAccountSaveMappingsValidationRes,
  getPostingResultsValidatorReq,
  getPostingResultsValidatorRes,
};
