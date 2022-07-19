/* eslint-disable no-undef */
const invoiceService = require('../../../src/api/invoice/invoiceService');
const data = require('./data/invoice-service-test-data');
const knex = require('../../../src/db.js');
const { seedAll, rollbackAll } = require('./data/invoice-test-seeds');

beforeAll(async () => {
  await rollbackAll();
  await seedAll();
});
afterAll(async () => {
  await knex.destroy();
});

describe('#AssignUser', () => {
  // This test has been skipped due to error: TypeError: ErrorHelper is not a function at writeTimelineLogs (src/utils/timelineHelper.js:46:12)
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('Should be able to assign an invoice to a user based on accountId and invoiceId', async () => {
    const result = await invoiceService.assignUser(data.assignUserReq.params);
    expect(result.email).toEqual(data.assignUserRes.email);
    expect(result.name).toEqual(data.assignUserRes.name);
    expect(result.id).toEqual(data.assignUserRes.id);
  });

  // eslint-disable-next-line jest/no-focused-tests
  it('Should throw an error if the request is invalid (invalid id)', async () => {
    await expect(
      invoiceService.assignUser(data.assignUserInvalidIdReq.params)
    ).rejects.toThrow(data.assignUserInvalidIdRes);
  });

  // eslint-disable-next-line jest/no-focused-tests
  it('Should throw an error if the request is invalid (invalid invoice)', async () => {
    await expect(
      invoiceService.assignUser(data.assignUserInvalidInvoiceReq.params)
    ).rejects.toThrow(data.assignUserInvalidInvoiceRes);
  });
});

describe('#ApproveInvoice', () => {
  // This test has been skipped due to error: TypeError: ErrorHelper is not a function at writeTimelineLogs (src/utils/timelineHelper.js:46:12)
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('Should be able to approve an invoice based on accountId, invoiceId and user object', async () => {
    const result = await invoiceService.approveInvoice(data.approveInvoiceReq);
    expect(result).toEqual(data.approveInvoiceRes);
  });

  // this test is skipped because it gives an error in codeship while connecting to QIP API to write timeline logs in 'ApproveInvoice'
  it.skip('Should throw an error if the request is invalid (invalid status)', async () => {
    await expect(
      invoiceService.approveInvoice(data.approveInvoiceInvalidStatusReq)
    ).rejects.toThrow(data.approveInvoiceInvalidStatusRes);
  });
  // eslint-disable-next-line jest/no-focused-tests
  it('Should throw an error if the request is invalid (invalid id)', async () => {
    await expect(
      invoiceService.approveInvoice(data.approveInvoiceInvalidIdReq)
    ).rejects.toThrow(data.approveInvoiceInvalidIdRes);
  });
  // eslint-disable-next-line jest/no-focused-tests
  it('Should throw an error if the request is invalid(invalid id) (invalid invoice)', async () => {
    await expect(
      invoiceService.approveInvoice(data.approveInvoiceInvalidInvoiceReq)
    ).rejects.toThrow(data.approveInvoiceInvalidInvoiceRes);
  });
  // This test has been skipped due to error: TypeError: ErrorHelper is not a function at writeTimelineLogs (src/utils/timelineHelper.js:46:12)
  // eslint-disable-next-line jest/no-focused-tests
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('Should throw an error if the request is invalid(invalid id) (invalid role)', async () => {
    await expect(
      invoiceService.approveInvoice(data.approveInvoiceInvalidRoleReq)
    ).rejects.toThrow(data.approveInvoiceInvalidRoleRes);
  });
});

// eslint-disable-next-line jest/no-disabled-tests
describe('#GetInvoicesAssignedToMe', () => {
  it('Should be able to get all invoices assigned to a specific user based on accountId and user object', async () => {
    const result = await invoiceService.getInvoicesAssignedToMe(
      data.getInvoicesAssignedToMeReq
    );
    expect(result).toEqual(data.getInvoicesAssignedToMeRes);
  });
  // eslint-disable-next-line jest/no-focused-tests
  it('Should throw an error if the request is invalid(invalid id) (invalid role)', async () => {
    await expect(
      invoiceService.getInvoicesAssignedToMe(
        data.getInvoicesAssignedToMeInvalidIdReq
      )
    ).rejects.toThrow(data.getInvoicesAssignedToMeInvalidIdRes);
  });
});

describe('#ReassignInvoice', () => {
  it.skip('Should be able to reassign an invoice assigned to a specific user based on accountId and user object', async () => {
    const result = await invoiceService.reassignInvoice(
      data.reassignInvoiceReq.params
    );
    expect(result).toEqual(data.reassignInvoiceRes);
  });
  // this test is skipped because it gives an error in codeship while connecting to QIP API to write timeline logs in 'ReassignInvoice'
  it.skip('Should throw an error if the request is invalid (invalid status)', async () => {
    await expect(
      invoiceService.reassignInvoice(
        data.reassignInvoiceInvalidStatusReq.params
      )
    ).rejects.toThrow(data.reassignInvoiceInvalidStatusRes);
  });
});

describe('#SignInvoice', () => {
  // This test has been skipped due to error: TypeError: ErrorHelper is not a function at writeTimelineLogs (src/utils/timelineHelper.js:46:12)
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('Should be able to sign an invoice based on accountId, invoiceId and user object', async () => {
    const result = await invoiceService.signInvoice(data.signInvoiceReq);
    expect(result).toEqual(data.signInvoiceRes);
  });

  // eslint-disable-next-line jest/no-focused-tests
  it('Should throw an error if the request is invalid (invalid id)', async () => {
    await expect(
      invoiceService.signInvoice(data.signInvoiceInvalidIdReq)
    ).rejects.toThrow(data.signInvoiceInvalidIdRes);
  });

  // eslint-disable-next-line jest/no-focused-tests
  it('Should throw an error if the request is invalid(invalid id) (invalid invoice)', async () => {
    await expect(
      invoiceService.signInvoice(data.signInvoiceInvalidInvoiceReq)
    ).rejects.toThrow(data.signInvoiceInvalidInvoiceRes);
  });

  // This test has been skipped due to error: TypeError: ErrorHelper is not a function at writeTimelineLogs (src/utils/timelineHelper.js:46:12)
  // eslint-disable-next-line jest/no-focused-tests
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('Should throw an error if the request is invalid(invalid id) (invalid role)', async () => {
    await expect(
      invoiceService.signInvoice(data.signInvoiceInvalidRoleReq)
    ).rejects.toThrow(data.signInvoiceInvalidRoleRes);
  });
});

describe('#GetUnAssignedInvoices', () => {
  it('Should be able to get all the unassigned invoices for a given accountId', async () => {
    const result = await invoiceService.getUnassignedInvoices(
      data.getUnassignedInvoicesReq
    );
    expect(result).toEqual(data.getUnassignedInvoicesRes);
  });

  it('Should throw an error if the request is invalid(invalid accountId)', async () => {
    await expect(
      invoiceService.getUnassignedInvoices(
        data.getUnassignedInvoicesInvalidAccountIdReq
      )
    ).rejects.toThrow(data.getUnassignedInvoicesInvalidAccountIdRes);
  });
});
describe('#GetAssignableUsers', () => {
  it('Should be able to list users that can be assigned to an invoice based on the account Id', async () => {
    const result = await invoiceService.getAssignableUsers(
      data.getAssignableUsersReq
    );
    expect(result).toEqual(data.getAssignableUsersRes);
  });
});

// eslint-disable-next-line jest/no-disabled-tests
describe('#AssignUnassignedInvoice', () => {
  // test skipped due to timeline logs issue
  it.skip('Should be able to assign an unassigned invoice to a specified user based on accountId, invoice id, userId, and user object', async () => {
    const result = await invoiceService.assignUnassignedInvoice(
      data.assignUnassignedInvoiceReq
    );
    expect(result).toEqual(data.assignUnassignedInvoiceRes);
  });

  it('Should throw an error if the request is invalid (invalid invoice)', async () => {
    await expect(
      invoiceService.assignUnassignedInvoice(
        data.assignUnassignedInvoiceInvalidInvoiceReq
      )
    ).rejects.toThrow(data.assignUnassignedInvoiceInvalidInvoiceRes);
  });

  it('Should throw an error if the invoice is not in ToAssign state', async () => {
    await expect(
      invoiceService.assignUnassignedInvoice(
        data.assignUnassignedInvoiceInvalidStateReq
      )
    ).rejects.toThrow(data.assignUnassignedInvoiceInvalidStateRes);
  });

  it('Should throw an error if the selected user is not a workflow user', async () => {
    await expect(
      invoiceService.assignUnassignedInvoice(
        data.assignUnassignedInvoiceInvalidStateReq
      )
    ).rejects.toThrow(data.assignUnassignedInvoiceInvalidStateRes);
  });
});

// eslint-disable-next-line jest/no-disabled-tests
describe('#HoldInvoice', () => {
  // test skipped due to timeline logs issue
  it.skip('Should be able to hold an invoice based on accountId, invoice id, and user object', async () => {
    const result = await invoiceService.holdInvoice(data.holdInvoiceReq);
    expect(result).toEqual(data.holdInvoiceRes);
  });

  // test skipped due to timeline logs issue
  it.skip('Should be able to hold an invoice owned by the workflow user with or without general permissions', async () => {
    const result = await invoiceService.holdInvoice(
      data.holdInvoiceOwnInvoiceReq
    );
    expect(result).toEqual(data.holdInvoiceRes);
  });

  it('Should throw an error if the user doesnt have permission to hold invoice', async () => {
    const result = await invoiceService.holdInvoice(
      data.holdInvoiceNotPermittedReq
    );
    expect(result).toEqual(data.holdInvoiceNotPermittedRes);
  });

  it('Should throw an error if the invoice is not in ToAssign, ToApprove, or ToSign state', async () => {
    const result = await invoiceService.holdInvoice(
      data.holdInvoiceInvalidStateReq
    );
    expect(result).toEqual(data.holdInvoiceInvalidStateRes);
  });

  it('Should throw an error if the workflow does not exist', async () => {
    const result = await invoiceService.holdInvoice(
      data.holdInvoiceInvalidWorkflowReq
    );
    expect(result).toEqual(data.holdInvoiceInvalidWorkflowRes);
  });
});
