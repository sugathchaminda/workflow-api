const inviteValidator = require('../../../src/api/invite/inviteValidation');
const data = require('./data/invite-validator-test-data');
const knex = require('../../../src/db.js');

afterAll(() => knex.destroy());

describe('#addInviteWorkflowAndAlias', () => {
  it('Should validate the input parameters and body to invite user to the workflow', async () => {
    const result = await inviteValidator.addInviteWorkflowAndAlias(
      data.addInviteWorkflowAndAliasReq
    );
    expect(result).toEqual(data.addInviteWorkflowAndAliasRes);
  });
  // eslint-disable-next-line jest/no-focused-tests
  it('should throw a request validation error if request is invalid (invalid id)', async () => {
    // eslint-disable-next-line jest/valid-expect
    await expect(
      inviteValidator.addInviteWorkflowAndAlias(
        data.addInviteWorkflowAndAliasInvalidIdReq
      )
    ).rejects.toThrow(data.addInviteWorkflowAndAliasInvalidIdRes);
  });
  // eslint-disable-next-line jest/no-focused-tests
  it('should throw a request validation error if request is invalid (invalid invite)', async () => {
    // eslint-disable-next-line jest/valid-expect
    await expect(
      inviteValidator.addInviteWorkflowAndAlias(
        data.addInviteWorkflowAndAliasInvalidInviteReq
      )
    ).rejects.toThrow(data.addInviteWorkflowAndAliasInvalidInviteRes);
  });
});

describe('#fetchInviteWorkflowInfo', () => {
  it('Should validate the input parameters to fetch workflow invite info', async () => {
    const result = await inviteValidator.fetchInviteWorkflowInfo(
      data.fetchInviteWorkflowInfoReq
    );
    expect(result).toEqual(data.fetchInviteWorkflowInfoRes);
  });
  // eslint-disable-next-line jest/no-focused-tests
  it('should throw a request validation error if request is invalid (invalid id)', async () => {
    // eslint-disable-next-line jest/valid-expect
    await expect(
      inviteValidator.fetchInviteWorkflowInfo(
        data.fetchInviteWorkflowInfoInvalidIdReq
      )
    ).rejects.toThrow(data.fetchInviteWorkflowInfoInvalidIdRes);
  });
  // eslint-disable-next-line jest/no-focused-tests
  it('should throw a request validation error if request is invalid (invalid ids)', async () => {
    // eslint-disable-next-line jest/valid-expect
    await expect(
      inviteValidator.fetchInviteWorkflowInfo(
        data.fetchInviteWorkflowInfoInvalidIdsReq
      )
    ).rejects.toThrow(data.fetchInviteWorkflowInfoInvalidIdsRes);
  });
});

describe('#deleteInviteWorkflowInfo', () => {
  it('Should validate the input parameters to delete workflow invite info', async () => {
    const result = await inviteValidator.deleteInviteWorkflowInfo(
      data.deleteInviteWorkflowInfoReq
    );
    expect(result).toEqual(data.deleteInviteWorkflowInfoRes);
  });
  // eslint-disable-next-line jest/no-focused-tests
  it('should throw a request validation error if request is invalid (invalid id)', async () => {
    // eslint-disable-next-line jest/valid-expect
    await expect(
      inviteValidator.deleteInviteWorkflowInfo(
        data.deleteInviteWorkflowInfoInvalidIdReq
      )
    ).rejects.toThrow(data.deleteInviteWorkflowInfoInvalidIdRes);
  });
  // eslint-disable-next-line jest/no-focused-tests
  it('should throw a request validation error if request is invalid (invalid invite)', async () => {
    // eslint-disable-next-line jest/valid-expect
    await expect(
      inviteValidator.deleteInviteWorkflowInfo(
        data.deleteInviteWorkflowInfoInvalidInviteReq
      )
    ).rejects.toThrow(data.deleteInviteWorkflowInfoInvalidInviteRes);
  });
});

describe('#addWorkflowInfoForAcceptedUser', () => {
  it('Should validate the input parameters to add workflow info to an accepted user', async () => {
    const result = await inviteValidator.addWorkflowInfoForAcceptedUser(
      data.addWorkflowInfoForAcceptedUserReq
    );
    expect(result).toEqual(data.addWorkflowInfoForAcceptedUserRes);
  });
  // eslint-disable-next-line jest/no-focused-tests
  it('should throw a request validation error if request is invalid (invalid id)', async () => {
    // eslint-disable-next-line jest/valid-expect
    await expect(
      inviteValidator.addWorkflowInfoForAcceptedUser(
        data.addWorkflowInfoForAcceptedUserInvalidIdReq
      )
    ).rejects.toThrow(data.addWorkflowInfoForAcceptedUserInvalidIdRes);
  });
  // eslint-disable-next-line jest/no-focused-tests
  it('should throw a request validation error if request is invalid (invalid invite)', async () => {
    // eslint-disable-next-line jest/valid-expect
    await expect(
      inviteValidator.addWorkflowInfoForAcceptedUser(
        data.addWorkflowInfoForAcceptedUserInvalidInviteReq
      )
    ).rejects.toThrow(data.addWorkflowInfoForAcceptedUserInvalidInviteRes);
  });
});
