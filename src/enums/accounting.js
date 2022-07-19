const chartOfAccountStatusEnums = {
  draft: 'draft',
  published: 'published',
};

const mappingStatusEnums = {
  draft: 'draft',
  published: 'published',
};

const allowedOperationsEnum = {
  added: 'added',
  deleted: 'deleted',
  edited: 'edited',
};

const vatTypesEnum = {
  input: 'input',
  output: 'output',
  input_eu: 'input_eu',
  output_eu: 'output_eu',
};

const vatTypesList = ['input', 'output', 'input_eu', 'output_eu'];

const batchProcessStatusEnum = {
  started: 'started',
  completed: 'completed',
  failed: 'failed',
};

const batchProcessContextEnum = {
  chart_of_accounts: 'chart_of_accounts',
};

const chartOfAccountVatTyes = {
  input: 'input',
  output: 'output',
  input_eu: 'input_eu',
  output_eu: 'output_eu',
};

const vatExCodes = {
  VATEX_EU_AE: 'VATEX-EU-AE',
};

const taxCategory = {
  AE: 'AE', // reverse charge
  E: 'E',
};

module.exports = {
  mappingStatusEnums,
  allowedOperationsEnum,
  vatTypesList,
  chartOfAccountStatusEnums,
  chartOfAccountVatTyes,
  vatExCodes,
  vatTypesEnum,
  batchProcessStatusEnum,
  batchProcessContextEnum,
  taxCategory,
};
