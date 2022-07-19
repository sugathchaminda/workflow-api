/* eslint-disable no-undef */
const invoiceValidator = require('../../../src/api/invoice/invoiceValidation');
const data = require('./data/invoice-validator-test-data');
const knex = require('../../../src/db.js');

afterAll(() => knex.destroy());

describe('Invoice validator test suite', () => {
  describe('#AssignUser', () => {
    it('Should validate the params for assigning an invoice to a user based on accountId and invoiceId', async () => {
      const result = await invoiceValidator.assignUser(
        data.assignUserValidatorReq
      );
      expect(result).toEqual(data.assignUserValidatorRes);
    });
    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid id)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        invoiceValidator.assignUser(data.assignUserValidatorInvalidIdReq)
      ).rejects.toThrow(data.assignUserValidatorInvalidIdRes);
    });
    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid invoice)', async () => {
      await expect(
        invoiceValidator.assignUser(data.assignUserValidatorInvalidInvoiceReq)
      ).rejects.toThrow(data.assignUserValidatorInvalidInvoiceRes);
    });
  });

  describe('#ApproveInvoice', () => {
    it('Should validate the params and user for approving an invoice for a user based on accountId, invoiceId and user object', async () => {
      const result = await invoiceValidator.approveInvoice(
        data.approveInvoiceValidatorReq
      );
      expect(result).toEqual(data.approveInvoiceValidatorRes);
    });

    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid id)', async () => {
      await expect(
        invoiceValidator.approveInvoice(
          data.approveInvoiceValidatorInvalidIdReq
        )
      ).rejects.toThrow(data.approveInvoiceValidatorInvalidIdRes);
    });
    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid invoice)', async () => {
      await expect(
        invoiceValidator.approveInvoice(
          data.approveInvoiceValidatorInvalidInvoiceReq
        )
      ).rejects.toThrow(data.approveInvoiceValidatorInvalidInvoiceRes);
    });
  });

  describe('#GetInvoicesAssignedToMe', () => {
    it('Should validate the params and user for getting all invoices assiged to a user based on accountId, invoiceId and user object', async () => {
      const result = await invoiceValidator.getInvoicesAssignedToMe(
        data.getInvoicesAssignedToMeReq
      );
      expect(result).toEqual(data.getInvoicesAssignedToMeRes);
    });
    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid id)', async () => {
      // eslint-disable-next-line jest/valid-expect
      expect(async () => {
        await invoiceValidator
          .getInvoicesAssignedToMe(data.getInvoicesAssignedToMeInvalidIdReq)
          .toThrow(data.getInvoicesAssignedToMeInvalidIdRes);
      });
      await expect(
        invoiceValidator.getInvoicesAssignedToMe(
          data.getInvoicesAssignedToMeInvalidIdReq
        )
      ).rejects.toThrow(data.getInvoicesAssignedToMeInvalidIdRes);
    });
  });

  describe('#ReassignInvoice', () => {
    it('Should validate the params for reassigning an invoice to a user based on accountId and invoiceId', async () => {
      const result = await invoiceValidator.reassignInvoice(
        data.reassignInvoiceValidatorReq
      );
      expect(result).toEqual(data.reassignInvoiceValidatorRes);
    });
    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid id)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        invoiceValidator.reassignInvoice(
          data.reassignInvoiceValidatorInvalidIdReq
        )
      ).rejects.toThrow(data.reassignInvoiceValidatorInvalidIdRes);
    });
    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid invoice)', async () => {
      await expect(
        invoiceValidator.reassignInvoice(
          data.reassignInvoiceValidatorInvalidInvoiceReq
        )
      ).rejects.toThrow(data.reassignInvoiceValidatorInvalidInvoiceRes);
    });
    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid user id)', async () => {
      await expect(
        invoiceValidator.reassignInvoice(
          data.reassignInvoiceValidatorInvalidUserReq
        )
      ).rejects.toThrow(data.reassignInvoiceValidatorInvalidUserRes);
    });
  });

  describe('#GetUnassignedInvoices', () => {
    it('Should validate the params for getting unassigned invoices to a user based on accountId', async () => {
      const result = await invoiceValidator.getUnassignedInvoices(
        data.unAssignedInvoicesValidatorReq
      );
      expect(result).toEqual(data.unAssignedInvoicesValidatorRes);
    });

    it('should throw a request validation error if request is invalid (invalid accountId)', async () => {
      await expect(
        invoiceValidator.getUnassignedInvoices(
          data.unAssignedInvoicesInvalidAccountIdReq
        )
      ).rejects.toThrow(data.unAssignedInvoicesInvalidAccountIdRes);
    });
  });
});
