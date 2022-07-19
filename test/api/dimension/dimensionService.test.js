const { v4: uuidv4 } = require('uuid');
const { it } = require('@jest/globals');
const dimensionService = require('../../../src/api/dimension/dimensionService');
const data = require('./data/dimension-service-test-data');
const knex = require('../../../src/db.js');
const { enums } = require('../../../src/enums/tagMapObjectTypes');

beforeAll(async () => {
  await knex('tagmap').del().where({ account: 10, object_id: 1, tag: 2 });

  await knex('tagmap').insert([
    {
      id: 10,
      uuid: uuidv4(),
      tag: 2,
      object_id: 1,
      object_type: enums.incoming_invoice_item,
      account: 10,
    },
    {
      id: 11,
      uuid: uuidv4(),
      tag: 3,
      object_id: 1,
      object_type: enums.incoming_invoice_item,
      account: 4,
    },
  ]);
});

afterAll(async () => {
  await knex('tagmap').del().where({ id: 11 });

  await knex.destroy();
});

describe('Dimension Service Test Suit', () => {
  describe('#AddDimensions', () => {
    it('One object type can be tagged from a one service call', async () => {
      await expect(
        dimensionService.addDimensions(data.addDimensionsOneObjectTypeReq)
      ).rejects.toThrow(data.addDimensionsOneObjectTypeRes);
    });

    it('One invoice can be tagged from a one service call', async () => {
      await expect(
        dimensionService.addDimensions(data.addDimensionsOneInvoiceReq)
      ).rejects.toThrow(data.addDimensionsOneInvoiceRes);
    });

    it('Already existing dimensions should not be created', async () => {
      await expect(
        dimensionService.addDimensions(data.addDimensionsAlreadyExistsReq)
      ).rejects.toThrow(data.addDimensionsAlreadyExistsRes);
    });

    it('Tags should belong to the account', async () => {
      await expect(
        dimensionService.addDimensions(
          data.addDimensionsTagsNotBelongToAccountReq
        )
      ).rejects.toThrow(data.addDimensionsTagsNotBelongToAccountRes);
    });

    it('Tag types cannot be entered', async () => {
      await expect(
        dimensionService.addDimensions(data.addDimensionsTagTypesNotAllowedReq)
      ).rejects.toThrow(data.addDimensionsTagTypesNotAllowedRes);
    });

    it('Invoice should belong to the account', async () => {
      await expect(
        dimensionService.addDimensions(
          data.addDimensionsInvoiceNotBelongsToAccountReq
        )
      ).rejects.toThrow(data.addDimensionsInvoiceNotBelongsToAccountRes);
    });

    it('Invoice items should belong to the account', async () => {
      await expect(
        dimensionService.addDimensions(
          data.addDimensionsInvoiceItemsNotBelongToAccountReq
        )
      ).rejects.toThrow(data.addDimensionsInvoiceItemsNotBelongToAccountRes);
    });

    it('Dimension total percentage should not exceed 100%', async () => {
      await expect(
        dimensionService.addDimensions(
          data.addDimensionsTotalPercentageCheckReq
        )
      ).rejects.toThrow(data.addDimensionsTotalPercentageCheckRes);
    });

    it('Dimension total should not exceed invoice total', async () => {
      await expect(
        dimensionService.addDimensions(data.addDimensionsTotalValueCheckReq)
      ).rejects.toThrow(data.addDimensionsTotalValueCheckRes);
    });

    it('Should be able to add dimensions to a given invoice in a given user account', async () => {
      const serviceResult = await dimensionService.addDimensions(
        data.addDimensionsReq
      );
      expect(serviceResult).toMatchObject(data.addDimensionsRes);
    });
  });

  describe('#UpdateDimensions', () => {
    it('Should be able to update dimensions to a given invoice in a given user account', async () => {
      const serviceResult = await dimensionService.updateDimensions(
        data.updateDimensionsReq
      );
      expect(serviceResult).toMatchObject(data.updateDimensionsRes);
    });

    it('One object type can be tagged from a one service call', async () => {
      await expect(
        dimensionService.updateDimensions(data.addDimensionsOneObjectTypeReq)
      ).rejects.toThrow(data.addDimensionsOneObjectTypeRes);
    });

    it('One invoice can be tagged from a one service call', async () => {
      await expect(
        dimensionService.updateDimensions(data.addDimensionsOneInvoiceReq)
      ).rejects.toThrow(data.addDimensionsOneInvoiceRes);
    });

    it('Tags should belong to the account', async () => {
      await expect(
        dimensionService.updateDimensions(
          data.addDimensionsTagsNotBelongToAccountReq
        )
      ).rejects.toThrow(data.addDimensionsTagsNotBelongToAccountRes);
    });

    it('Tag types cannot be entered', async () => {
      await expect(
        dimensionService.updateDimensions(
          data.addDimensionsTagTypesNotAllowedReq
        )
      ).rejects.toThrow(data.addDimensionsTagTypesNotAllowedRes);
    });

    it('Invoice should belong to the account', async () => {
      await expect(
        dimensionService.updateDimensions(
          data.addDimensionsInvoiceNotBelongsToAccountReq
        )
      ).rejects.toThrow(data.addDimensionsInvoiceNotBelongsToAccountRes);
    });

    it('Invoice items should belong to the account', async () => {
      await expect(
        dimensionService.updateDimensions(
          data.addDimensionsInvoiceItemsNotBelongToAccountReq
        )
      ).rejects.toThrow(data.addDimensionsInvoiceItemsNotBelongToAccountRes);
    });

    it('Dimension total percentage should not exceed 100%', async () => {
      await expect(
        dimensionService.updateDimensions(
          data.addDimensionsTotalPercentageCheckReq
        )
      ).rejects.toThrow(data.addDimensionsTotalPercentageCheckRes);
    });

    it('Dimension total should not exceed invoice total', async () => {
      await expect(
        dimensionService.updateDimensions(data.addDimensionsTotalValueCheckReq)
      ).rejects.toThrow(data.addDimensionsTotalValueCheckRes);
    });
  });

  describe('#DeleteDimensions', () => {
    it('Should validate ownership of invoice', async () => {
      expect(
        await dimensionService.deleteDimensions(data.invoiceNotBelongsToUserReq)
      ).toEqual(data.invoiceNotBelongsToUserRes);
    });

    it('Should tags belongs to user', async () => {
      expect(
        await dimensionService.deleteDimensions(
          data.deleteDimensionsNotBelongsReq
        )
      ).toEqual(data.deleteDimensionsNotBelongsRes);
    });

    it('Should be able to delete given dimensions', async () => {
      expect(
        await dimensionService.deleteDimensions(data.deleteDimensionsReq)
      ).toEqual(data.deleteDimensionsRes);
    });
  });
});
