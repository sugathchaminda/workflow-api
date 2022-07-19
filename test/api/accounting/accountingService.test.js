const { it, expect } = require('@jest/globals');
const accountingService = require('../../../src/api/accounting/accountingService');
const data = require('./data/accounting-service-test-data');
const knex = require('../../../src/db');
const chartOfAccountHelper = require('../../../src/utils/chartOfAccountHelper');

const {
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
} = data;

beforeAll(async () => {
  const table = knex('chart_of_account');
  await knex('posting_category').del();
  await table.del();
  await knex('posting_invoice_item').del();
  await table.insert([
    {
      id: 1,
      supplier: 1,
      reference: null,
      account_number: '1000',
      account_name: 'account 1',
      deductibility: 100,
      status: 'published',
      operation: 'added',
      vat_type: null,
    },
    {
      id: 2,
      supplier: 1,
      reference: null,
      account_number: '1002',
      account_name: 'account 2',
      deductibility: 100,
      status: 'published',
      operation: 'added',
    },
    {
      id: 3,
      supplier: 1,
      reference: null,
      account_number: '1003',
      account_name: 'account 3',
      deductibility: 80,
      operation: 'added',
      status: 'published',
    },
    {
      id: 4,
      supplier: 1,
      reference: null,
      account_number: '1004',
      account_name: 'account 4',
      deductibility: 100,
      status: 'draft',
      operation: 'added',
    },
    {
      id: 10,
      supplier: 1,
      reference: null,
      account_number: '1010',
      account_name: 'account 10',
      deductibility: null,
      status: 'published',
      operation: 'added',
      vat_type: 'input',
    },
  ]);
  await knex('batch_process_status').del().where('id', '=', 1);
  await knex('batch_process_status').insert([
    {
      id: 1,
      supplier: 1,
      context: 'chart_of_accounts',
      status: 'completed',
    },
  ]);
  await knex.raw('ALTER SEQUENCE chart_of_account_id_seq RESTART WITH 6');
  await knex('posting_category')
    .insert([
      {
        chart_of_account: 1,
        category_code: '23000000',
        status: 'draft',
        createdAt: new Date('2021-08-01 00:00:00'),
        updatedAt: new Date('2021-08-01 00:00:00'),
      },
      {
        chart_of_account: 1,
        category_code: '46101501',
        status: 'published',
        createdAt: new Date('2021-08-01 00:00:00'),
        updatedAt: new Date('2021-08-01 00:00:00'),
      },
    ])
    .returning('id');

  await knex('posting_invoice_item').insert({
    supplier: 1,
    invoice: 1,
    account_name: '001',
    account_number: '001',
    account_type: 'cost',
    tag: null,
    deductibility: 100,
    amount_document: 100,
    amount_local: 100,
    amount_euro: 100,
  });
  await knex('exchangerate').insert({
    id: 1,
    date: '2021-03-31 18:11:20',
    rates: {
      EUR: 1,
      GBP: 0.852756,
      SEK: 10.191649,
    },
  });
  await knex('incominginvoiceitem').update({
    category: { unspsc: { code: '46101501', name: 'Machine guns' } },
  });
  await knex('incominginvoice').update({ createdAt: '2019-01-21' });
});

afterAll(async () => {
  await knex('posting_invoice_item').del().where('id', 1);
  await knex('posting_category')
    .del()
    .whereIn('category_code', [
      '23000000',
      'test_code_2',
      'test_code_1',
      '46101501',
    ]);
  await knex('chart_of_account').del().whereIn('id', [1, 2, 3, 4, 5, 6, 10]);
  await knex('exchangerate').del().whereIn('id', [1]);
  await knex('incominginvoiceitem').update({ category: null });
  await knex('incominginvoice').update({ createdAt: null });
  await knex.destroy();
});

describe('Accounting Service Test Suit', () => {
  describe('#GetLandingPageInfo', () => {
    it('Should return all false, when there is no any chart of accounts in the system', async () => {
      const result = await accountingService.getLandingPageInfo(
        data.getLandingPageInfoReq
      );

      expect(result).toEqual(data.getLandingPageInfoRes);
    });
  });

  describe('#GetChartofAccounts', () => {
    it('Should list the chart of accounts belonging to supplier', async () => {
      const result = await accountingService.getChartOfAccounts(
        data.getChartOfAccountsReq
      );

      expect(result.accounts).toMatchObject(
        data.getChartOfAccountsRes.accounts
      );
    });

    it('Should send a message if the upload process has not been finished', async () => {
      await knex('batch_process_status')
        .update({ status: 'started' })
        .where('id', '=', 1);

      const result = await accountingService.getChartOfAccounts(
        data.getChartOfAccountsReq
      );

      await knex('batch_process_status')
        .update({ status: 'completed' })
        .where('id', '=', 1);

      expect(result).toMatchObject(data.getChartOfAccountUploadNotCompletedRes);
    });

    it('Should send an error message if the upload process has not initialised', async () => {
      await knex('batch_process_status').del();

      const result = await accountingService.getChartOfAccounts(
        data.getChartOfAccountsReq
      );

      await knex('batch_process_status').insert([
        {
          id: 1,
          supplier: 1,
          context: 'chart_of_accounts',
          status: 'completed',
        },
      ]);

      expect(result).toMatchObject(data.getChartOfAccountUploadNotStartedRes);
    });
  });

  describe('#SaveAccountsDraft', () => {
    it('Should save draft accounts', async () => {
      const result = await accountingService.saveAccountsDraft(
        data.saveAccountsDraftSuccessReq
      );
      expect(result).toMatchObject(data.saveAccountsDraftSuccessRes);
    });

    it('Should throw an error when attempted to save a duplicate draft', async () => {
      const result = await accountingService.saveAccountsDraft(
        data.saveAccountsDraftDuplicateDraftErrorReq
      );
      expect(result).toMatchObject(
        data.saveAccountsDraftDuplicateDraftErrorRes
      );
    });
  });

  describe('#GetChartofAccountMappings', () => {
    it('Should list the chart of accounts and its mappings data belonging to supplier', async () => {
      const result = await accountingService.getChartOfAccountMappings(
        data.getChartOfAccountMappingsReq
      );

      result.mappings.forEach((mappingData) => {
        expect(data.getChartOfAccountMappingsRes.mappings).toContainEqual(
          expect.objectContaining(mappingData)
        );
      });
      expect(result.details).toMatchObject(
        data.getChartOfAccountMappingsRes.details
      );
    });
  });

  describe('#ChartOfAccountSaveMappings', () => {
    it('Should save the chart of account category mapping data', async () => {
      const result = await accountingService.saveMappings(
        data.chartOfAccountSaveMappingsReq
      );
      expect(result).toEqual(data.chartOfAccountSaveMappingsRes);
    });
  });

  describe('#GetPostingResults', () => {
    it('Should return the posting results for the given invoice id', async () => {
      const result = await accountingService.getPostingResults(
        data.getPostingResultsSuccessReq
      );
      expect(result).toMatchObject(data.getPostingResultsSuccessRes);
    });
  });

  describe('#PublishChartOfAccountsAndMappings', () => {
    it('Should publish chart of accounts and mappings', async () => {
      const result = await accountingService.publishMappings(
        data.publishMappingsAndChartOfAccountsReq
      );
      expect(result).toMatchObject(data.publishMappingsAndChartOfAccountsRes);
    });
  });

  describe('#AutomaticPrePosting', () => {
    it('Should covert amounts properly when local currency equals document currency', async () => {
      const result = await chartOfAccountHelper.convertCurrency(
        convertCurrencyReq.amount,
        convertCurrencyReq.documentCurrency,
        convertCurrencyReq.localCurrency,
        convertCurrencyReq.date
      );
      expect(result).toMatchObject(convertCurrencyRatesAvailableRes);
    });

    it('Should covert amounts properly when local currency differenc from document currency', async () => {
      const result = await chartOfAccountHelper.convertCurrency(
        convertCurrencyWhenDocAndLocalDifferReq.amount,
        convertCurrencyWhenDocAndLocalDifferReq.documentCurrency,
        convertCurrencyWhenDocAndLocalDifferReq.localCurrency,
        convertCurrencyWhenDocAndLocalDifferReq.date
      );
      expect(result).toMatchObject(convertCurrencyWhenDocAndLocalDifferRes);
    });

    it('Should find vatex info from vat summary, when vatex not available', async () => {
      const result = await chartOfAccountHelper.findVatExPropertyFromSummary(
        vatSummaryWithoutVatexReq
      );

      expect(result).toEqual('VATEX-EU-AE');
    });

    it('Should find vatex info from vat summary, when vatex available', async () => {
      const result = await chartOfAccountHelper.findVatExPropertyFromSummary(
        vatSummaryWithVatexReq
      );

      expect(result).toEqual('VATEX-EU-AE');
    });

    it('Should find VAT info for a given invoice item', async () => {
      const result = await chartOfAccountHelper.findVatInfo(
        getVatInfoReq.accountId,
        getVatInfoReq.invoiceItem,
        getVatInfoReq.invoice,
        getVatInfoReq.chartOfAccount
      );
      expect(result).toEqual(getVatInfoRes);
    });

    it('Should auto post without any error', async () => {
      const result = await accountingService.autoPosting(autoPostingReq);

      expect(result).toEqual(autoPostingRes);
    });

    it('Should work when rates is not available', async () => {
      await knex('exchangerate').del().whereIn('id', [1]);
      const result = await chartOfAccountHelper.convertCurrency(
        convertCurrencyReq.amount,
        convertCurrencyReq.documentCurrency,
        convertCurrencyReq.localCurrency,
        convertCurrencyReq.date
      );
      expect(result).toMatchObject(convertCurrencyNoRatesAvailableRes);
    });
  });
});
