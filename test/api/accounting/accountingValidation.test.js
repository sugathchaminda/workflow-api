const { expect } = require('@jest/globals');
const accountingValidator = require('../../../src/api/accounting/accountingValidation');
const data = require('./data/accounting-validator-test-data');
const knex = require('../../../src/db.js');

afterAll(() => knex.destroy());

describe('accounting validation test suite', () => {
  describe('#validateGetLandingPageInfo', () => {
    it('should validate if the req path param contain account id', async () => {
      const result = await accountingValidator.getLandingPageInfoValidation(
        data.getLandingPageInfoValidatorReq
      );
      expect(result).toEqual(data.getLandingPageInfoValidatorRes);
    });
  });

  describe('#validateUploadChartOfAccountSignedUrl', () => {
    it('should validate if the req path param contain account id; body should contain the relevant chart of accounts data', async () => {
      const result = await accountingValidator.uploadChartOfAccountSignedUrlValidation(
        data.uploadChartOfAccountValidatorReq
      );
      expect(result).toEqual(data.uploadChartOfAccountValidatorRes);
    });
  });

  describe('#ValidateGetChartOfAccounts', () => {
    it('should validate if the req path param contain account id', async () => {
      const result = await accountingValidator.getChartOfAccountsValidation(
        data.getChartOfAccountsValidatorReq
      );
      expect(result).toEqual(data.getChartOfAccountsValidatorRes);
    });
  });

  describe('#ValidateSaveAccountsDraft', () => {
    it('should validate if the req path param contain an account id, type, and the body contains accounts', async () => {
      const result = await accountingValidator.saveAccountsDraftValidation(
        data.saveAccountsDraftValidatorReq
      );
      expect(result).toEqual(data.saveAccountsDraftValidatorRes);
    });
  });

  describe('#ValidategetChartOfAccountMappings', () => {
    it('should validate if the req path param contain account id', async () => {
      const result = await accountingValidator.getChartOfAccountMappingsValidation(
        data.getChartOfAccountMappingsValidatorReq
      );
      expect(result).toEqual(data.getChartOfAccountMappingsValidatorRes);
    });
  });

  describe('#ValidategetChartOfAccountSaveMappings', () => {
    it('should validate if the req path param contain account id,  body should contain the relevant category mappings data', async () => {
      const result = await accountingValidator.saveMappingsValidation(
        data.chartOfAccountSaveMappingsValidationReq
      );
      expect(result).toEqual(data.chartOfAccountSaveMappingsValidationRes);
    });
  });

  describe('#ValidateGetPostingResults', () => {
    it('should validate if the req path param contain account id and an invoice id', async () => {
      const result = await accountingValidator.getPostingResultsValidation(
        data.getPostingResultsValidatorReq
      );
      expect(result).toEqual(data.getPostingResultsValidatorRes);
    });
  });
});
