const WorkflowService = require('../../../src/api/workflow/workflowService');
const data = require('./data/workflow-service-test-data');
const knex = require('../../../src/db.js');

afterAll(() => knex.destroy());

describe('Workflow Service Test Suit', () => {
  describe('#ToggleWorkflow', () => {
    it('Should be able to activate the workflow module for a given user account', async () => {
      const serviceResult = await WorkflowService.toggleWorkflow(
        data.toggleWorkflowReq.params
      );
      expect(serviceResult).toMatchObject(data.toggleWorkflowRes);
    });

    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        WorkflowService.toggleWorkflow(data.toggleWorkflowInvalidIdReq.params)
      ).rejects.toThrow(data.toggleWorkflowInvalidIdRes);
    });
  });

  describe('#ValidateAlias', () => {
    it('Should be able to validate the alias of a user given the accountId', async () => {
      const serviceResult = await WorkflowService.validateAlias(
        data.validateAliasReq.params
      );
      // this will pass since we're not using the user invite table and it's not part of the project
      expect(serviceResult).toEqual(false);
    });

    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid id)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        WorkflowService.validateAlias(data.validateAliasInvalidIdReq.params)
      ).rejects.toThrow(data.validateAliasInvalidIdRes);
    });
  });

  describe('#Fetch roles', () => {
    // eslint-disable-next-line jest/no-disabled-tests
    // eslint-disable-next-line jest/expect-expect
    it('Should fetch the available roles for a specific accountId', async () => {
      const serviceResult = await WorkflowService.fetchRoles(
        data.fetchRolesReq.params
      );

      expect(serviceResult).toMatchObject(data.fetchRolesRes);
    });

    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid id)', async () => {
      // eslint-disable-next-line jest/valid-expect
      const serviceResult = await WorkflowService.fetchRoles(
        data.fetchRolesInvalidIdReq.params
      );
      expect(serviceResult).toMatchObject(data.fetchRolesInvalidIdRes);
    });

    it('should throw a request validation error if request is invalid (invalid type)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        WorkflowService.fetchRoles(data.fetchRolesInvalidTypeReq.params)
      ).rejects.toThrow(data.fetchRolesInvalidTypeRes);
    });
  });

  describe('#Fetch roles by Id', () => {
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('Should fetch a specific role for a specific accountId and roleId', async () => {
      const serviceResult = await WorkflowService.fetchUsersForRoleId(
        data.fetchRolesByIdReq.params
      );

      expect(serviceResult).toHaveLength(1);
    });
    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid id)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        WorkflowService.fetchUsersForRoleId(
          data.fetchRolesByIdInvalidIdReq.params
        )
      ).rejects.toThrow(data.fetchRolesByIdInvalidIdRes);
    });

    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid role)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        WorkflowService.fetchUsersForRoleId(
          data.fetchRolesByIdInvalidRoleReq.params
        )
      ).rejects.toThrow(data.fetchRolesByIdInvalidRoleRes);
    });
  });
});
