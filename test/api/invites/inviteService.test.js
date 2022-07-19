const inviteService = require('../../../src/api/invite/inviteService');
const data = require('./data/invite-service-test-data');
const knex = require('../../../src/db.js');

afterAll(() => knex.destroy());

// skipped due to unique key constraint violations since it already exists once the test has been run
describe('#addInviteWorkflowAndAlias', () => {
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('Should add invite workflow and alias', async () => {
    const result = await inviteService.addInviteWorkflowAndAlias(
      data.addInviteWorkflowAndAliasReq
    );
    expect(result).toEqual(data.addInviteWorkflowAndAliasRes);
  });
  // eslint-disable-next-line jest/no-focused-tests
  it('should throw a request validation error if request is invalid (invalid id)', async () => {
    // eslint-disable-next-line jest/valid-expect
    await expect(
      inviteService.addInviteWorkflowAndAlias(
        data.addInviteWorkflowAndAliasInvalidIdReq
      )
    ).rejects.toThrow(data.addInviteWorkflowAndAliasInvalidIdRes);
  });
  // eslint-disable-next-line jest/no-focused-tests
  it('should throw a request validation error if request is invalid (invalid invite)', async () => {
    // eslint-disable-next-line jest/valid-expect
    await expect(
      inviteService.addInviteWorkflowAndAlias(
        data.addInviteWorkflowAndAliasInvalidInviteReq
      )
    ).rejects.toThrow(data.addInviteWorkflowAndAliasInvalidInviteRes);
  });
});

describe('#fetchInviteWorkflowInfo', () => {
  it('Should fech the invite workflow info', async () => {
    const result = await inviteService.fetchInviteWorkflowInfo(
      data.fetchInviteWorkflowInfoReq
    );
    expect(result).toEqual(data.fetchInviteWorkflowInfoRes);
  });
  // eslint-disable-next-line jest/no-focused-tests
  it('should throw a request validation error if request is invalid (invalid invite)', async () => {
    // eslint-disable-next-line jest/valid-expect
    const result = await inviteService.fetchInviteWorkflowInfo(
      data.fetchInviteWorkflowInfoInvalidIdsReq
    );
    expect(result).toEqual(data.fetchInviteWorkflowInfoInvalidIdsRes);
  });
});

// skipped due to duplicate keys in the workflow_alias table, need some help with alternative baseline data
describe('#addWorkflowInfoForAcceptedUser', () => {
  // eslint-disable-next-line jest/no-focused-tests
  it.skip('Should fetch the invite workflow info', async () => {
    const result = await inviteService.addWorkflowInfoForAcceptedUser(
      data.addWorkflowInfoForAcceptedUserReq
    );
    console.log('third', result);
  });
  // eslint-disable-next-line jest/no-focused-tests
  it('should throw a request validation error if request is invalid (invalid id)', async () => {
    // eslint-disable-next-line jest/valid-expect
    await expect(
      inviteService.addWorkflowInfoForAcceptedUser(
        data.addWorkflowInfoForAcceptedUserInvalidIdReq
      )
    ).rejects.toThrow(data.addWorkflowInfoForAcceptedUserInvalidIdRes);
  });
  // eslint-disable-next-line jest/no-focused-tests
  it('should throw a request validation error if request is invalid (invalid invite)', async () => {
    // eslint-disable-next-line jest/valid-expect
    const result = await inviteService.addWorkflowInfoForAcceptedUser(
      data.addWorkflowInfoForAcceptedUserInvalidInviteReq
    );
    expect(result).toEqual(data.addWorkflowInfoForAcceptedUserInvalidInviteRes);
  });
});

describe('#deleteInviteWorkflowInfo', () => {
  it('Should fech the invite workflow info', async () => {
    const result = await inviteService.deleteInviteWorkflowInfo(
      data.deleteInviteWorkflowInfoReq
    );
    expect(result).toEqual(data.deleteInviteWorkflowInfoRes);
  });
  // eslint-disable-next-line jest/no-focused-tests
  it('should throw a request validation error if request is invalid (invalid id)', async () => {
    // eslint-disable-next-line jest/valid-expect
    await expect(
      inviteService.deleteInviteWorkflowInfo(
        data.deleteInviteWorkflowInfoInvalidIdReq
      )
    ).rejects.toThrow(data.deleteInviteWorkflowInfoInvalidIdRes);
  });
  // eslint-disable-next-line jest/no-focused-tests
  it('should throw a request validation error if request is invalid (invalid invite)', async () => {
    // eslint-disable-next-line jest/valid-expect
    await expect(
      inviteService.deleteInviteWorkflowInfo(
        data.deleteInviteWorkflowInfoInvalidInviteReq
      )
    ).rejects.toThrow(data.deleteInviteWorkflowInfoInvalidInviteRes);
  });
});
