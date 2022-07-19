const getChartOfAccountsReq = {
  accountId: '1',
};

const getChartOfAccountsRes = {
  accounts: [
    {
      account_id: 1,
      reference: null,
      supplier: 1,
      account_number: '1000',
      account_name: 'account 1',
      deductibility: '100',
      vat_type: null,
      status: 'published',
      operation: 'added',
      is_mapped_to_category: true,
    },
    {
      account_id: 2,
      reference: null,
      supplier: 1,
      account_number: '1002',
      account_name: 'account 2',
      deductibility: '100',
      vat_type: null,
      status: 'published',
      operation: 'added',
      is_mapped_to_category: false,
    },
    {
      account_id: 3,
      reference: null,
      supplier: 1,
      account_number: '1003',
      account_name: 'account 3',
      deductibility: '80',
      vat_type: null,
      status: 'published',
      operation: 'added',
      is_mapped_to_category: false,
    },
    {
      account_id: 4,
      reference: null,
      supplier: 1,
      account_number: '1004',
      account_name: 'account 4',
      deductibility: '100',
      vat_type: null,
      status: 'draft',
      operation: 'added',
      is_mapped_to_category: false,
    },
    {
      account_id: 10,
      supplier: 1,
      reference: null,
      account_number: '1010',
      account_name: 'account 10',
      deductibility: null,
      status: 'published',
      operation: 'added',
      vat_type: 'input',
    },
  ],
  details: {
    lastPublishedDate: null,
    lastModifiedDate: null,
  },
};

const saveAccountsDraftSuccessReq = {
  accountId: '1',
  type: 'save',
  accounts: [
    {
      account_number: '1005',
      account_name: 'Account 5',
      deductibility: null,
      vat_type: null,
      operation: 'added',
    },
    {
      account_number: '1003',
      account_name: 'Account 3',
      deductibility: 100,
      vat_type: null,
      reference: 3,
      operation: 'edited',
    },
    {
      reference: 2,
      operation: 'deleted',
    },
  ],
};

const saveAccountsDraftSuccessRes = {
  message: 'Successfully saved draft.',
};

const getChartOfAccountMappingsReq = {
  accountId: 1,
};

const getChartOfAccountMappingsRes = {
  details: {
    lastModifiedDate: new Date('2021-08-01 00:00:00'),
    lastPublishedDate: new Date('2021-08-01 00:00:00'),
  },

  mappings: [
    {
      account_name: 'Account 3',
      account_number: '1003',
      status: null,
      account_id: 7,
      reference: 3,
      categories: [],
    },
    {
      account_name: 'Account 5',
      account_number: '1005',
      status: null,
      account_id: 6,
      reference: null,
      categories: [],
    },
    {
      account_name: 'account 1',
      account_number: '1000',
      status: 'draft',
      account_id: 1,
      reference: null,
      categories: [{ code: 23000000 }, { code: 46101501 }],
    },
    {
      account_name: 'account 10',
      account_number: '1010',
      status: null,
      account_id: 10,
      reference: null,
      categories: [],
    },
    {
      account_name: 'account 2',
      account_number: '1002',
      status: null,
      account_id: 2,
      reference: null,
      categories: [],
    },
    {
      account_name: 'account 3',
      account_number: '1003',
      status: null,
      account_id: 3,
      reference: null,
      categories: [],
    },
    {
      account_name: 'account 4',
      account_number: '1004',
      status: null,
      account_id: 4,
      reference: null,
      categories: [],
    },
  ],
};
const getLandingPageInfoReq = {
  accountId: 10,
};

const getLandingPageInfoRes = {
  has_coa_drafts: false,
  has_coa_published: false,
  last_coa_published_at: null,
  has_mapping_drafts: false,
  has_mapping_published: false,
  last_mapping_published_at: null,
  can_publish: false,
};

const getPostingResultsSuccessReq = {
  accountId: '1',
  invoiceId: '1',
};

const getPostingResultsSuccessRes = {
  columns: ['account', 'description', 'amount'],
  data: [{ account: '001', description: '001', amount: '100.00' }],
};

const getChartOfAccountUploadNotStartedRes = {
  statusCode: 422,
  error: 'Unprocessable Entity',
  message: 'Account upload has not initiated.',
};

const getChartOfAccountUploadNotCompletedRes = {
  message: 'PROCESSING_UPLOAD',
};

const saveAccountsDraftDuplicateDraftErrorReq = {
  accountId: '1',
  type: 'save',
  accounts: [
    {
      account_number: '1002',
      account_name: 'Account 6',
      deductibility: 80,
      vat_type: 'input',
      operation: 'added',
    },
  ],
};

const saveAccountsDraftDuplicateDraftErrorRes = {
  statusCode: 400,
  error: 'Bad Request',
  message: 'Request contains duplicate draft account insertions',
};

const chartOfAccountSaveMappingsReq = {
  accountId: '1',
  type: 'save_and_proceed',
  mappings: [
    {
      account_number: '1000',
      categories: [
        { code: 'test_code_1', operation: 'added' },
        { code: 'test_code_2', operation: 'added' },
      ],
    },
  ],
};

const chartOfAccountSaveMappingsRes = {
  message: 'Successfully saved category mappings.',
};

const publishMappingsAndChartOfAccountsReq = {
  accountId: '1',
};

const publishMappingsAndChartOfAccountsRes = {
  message: 'Chart of accounts and mappings published successfully.',
};

const convertCurrencyReq = {
  amount: 80,
  documentCurrency: 'SEK',
  localCurrency: 'SEK',
  date: new Date('2021-03-31 18:11:20'),
};

const convertCurrencyNoRatesAvailableRes = {
  local: 0,
  document: 80,
  system: 0,
};

const convertCurrencyRatesAvailableRes = {
  local: 80,
  document: 80,
  system: 7.85,
};

const convertCurrencyWhenDocAndLocalDifferReq = {
  amount: 80,
  documentCurrency: 'SEK',
  localCurrency: 'GBP',
  date: new Date('2021-03-31 18:11:20'),
};

const convertCurrencyWhenDocAndLocalDifferRes = {
  local: 6.69,
  document: 80,
  system: 7.85,
};

const getVatInfoReq = {
  accountId: 1,
  invoiceItem: {
    category: { unspsc: { code: '46101501', name: 'Machine guns' } },
    vat_summary: [],
    vat_amount_per_item: 43,
    quantity: 1,
  },
  invoice: [
    {
      sender_data: { country: 'SE', organization_number: '123456-1111' },
      receiver_data: {
        country: 'SE',
        reference: 'TestAuto2',
        vat_number: null,
        company_name: 'Test Automation Two AB',
        organization_number: '123456-1112',
      },
    },
  ],
  chartOfAccount: {
    deductibility: 100,
  },
};

const getVatInfoRes = [
  {
    account_number: '1010',
    account_name: 'account 10',
    vat_amount: 43,
    cost_amount: 0,
    type: 'input',
    sender_country: 'SE',
    receiver_country: 'SE',
  },
];

const autoPostingReq = {
  accountId: '1',
  invoiceId: '1',
};

const autoPostingRes = {
  message: 'Posting data added successfully',
  statusCode: 200,
};

const vatSummaryWithoutVatexReq = [
  {
    tax_category: 'AE',
    taxable_amount: 1160,
    currency: 'SEK',
    tax_amount: 69.6,
    percent: 6,
    tax_scheme: 'VAT',
  },
  {
    tax_category: 'S',
    taxable_amount: 1160,
    currency: 'SEK',
    tax_amount: 69.6,
    percent: 6,
    tax_scheme: 'VAT',
  },
];

const vatSummaryWithVatexReq = [
  {
    tax_category: 'AE',
    taxable_amount: 1160,
    currency: 'SEK',
    tax_amount: 69.6,
    percent: 6,
    tax_scheme: 'VAT',
    vatex: 'VATEX-EU-AE',
  },
];

module.exports = {
  getChartOfAccountsReq,
  getChartOfAccountsRes,
  saveAccountsDraftSuccessReq,
  saveAccountsDraftSuccessRes,
  getChartOfAccountMappingsReq,
  getChartOfAccountMappingsRes,
  getLandingPageInfoReq,
  getLandingPageInfoRes,
  chartOfAccountSaveMappingsReq,
  chartOfAccountSaveMappingsRes,
  getPostingResultsSuccessReq,
  getPostingResultsSuccessRes,
  getChartOfAccountUploadNotStartedRes,
  getChartOfAccountUploadNotCompletedRes,
  saveAccountsDraftDuplicateDraftErrorReq,
  saveAccountsDraftDuplicateDraftErrorRes,
  publishMappingsAndChartOfAccountsReq,
  publishMappingsAndChartOfAccountsRes,
  convertCurrencyReq,
  convertCurrencyNoRatesAvailableRes,
  convertCurrencyRatesAvailableRes,
  convertCurrencyWhenDocAndLocalDifferReq,
  convertCurrencyWhenDocAndLocalDifferRes,
  getVatInfoReq,
  getVatInfoRes,
  autoPostingReq,
  autoPostingRes,
  vatSummaryWithoutVatexReq,
  vatSummaryWithVatexReq,
};
