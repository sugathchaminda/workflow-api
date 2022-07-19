const { expect } = require('@jest/globals');
const dimensionValidator = require('../../../src/api/dimension/dimensionValidation');
const data = require('./data/dimension-validator-test-data');
const knex = require('../../../src/db.js');

afterAll(() => knex.destroy());

describe('dimension validation test suite', () => {
  describe('#validateAddDimensions', () => {
    it('should validate if the req path param contain account id; body should contain the relevant dimension data', async () => {
      const result = await dimensionValidator.addDimensionsValidation(
        data.addDimensionValidatorReq
      );
      expect(result).toEqual(data.addDimensionValidatorRes);
    });
  });

  describe('#validateUpdateDimensions', () => {
    it('should validate if the req path param contain account id; body should contain the relevant dimension data', async () => {
      const result = await dimensionValidator.updateDimensionsValidation(
        data.updateDimensionValidatorReq
      );
      expect(result).toEqual(data.updateDimensionValidatorRes);
    });
  });

  describe('#validateDeleteDeimensions', () => {
    it('should validate if the req path param contain account id and invoice id; body should containes tag ids', async () => {
      const result = await dimensionValidator.deleteDimensionsValidation(
        data.deleteDimensionValidatorReq
      );
      expect(result).toEqual(data.deleteDimensionValidatorRes);
    });
  });
});
