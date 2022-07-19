/* eslint-disable no-undef */

const workflowValidator = require('../../../src/api/workflow/workflowValidation');
const data = require('./data/workflow-validator-test-data');

const knex = require('../../../src/db.js');

afterAll(() => knex.destroy());

describe('Workflow validation test suite', () => {
  describe('#accountIdValidation', () => {
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('should validate for if the req path param contain account id', async () => {
      const result = await workflowValidator.accountIdValidation(
        data.accoutValidationReq
      );
      expect(result).toEqual(data.accoutValidationRes);
    });

    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        workflowValidator.accountIdValidation(data.accoutValidationInvalidReq)
      ).rejects.toThrow(data.accoutValidationInvalidRes);
    });
  });

  describe('#validateAlias', () => {
    it('should validate for if the req path param contain account id and alias', async () => {
      const result = await workflowValidator.validateAlias(
        data.validateAliasValidatorReq
      );

      expect(result).toEqual(data.validateAliasValidatorRes);
    });

    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid id)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        workflowValidator.validateAlias(data.validateAliasValidatorInvalidIdReq)
      ).rejects.toThrow(data.validateAliasValidatorInvalidIdRes);
    });

    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid alias)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        workflowValidator.validateAlias(
          data.validateAliasValidatorInvalidAliasReq
        )
      ).rejects.toThrow(data.validateAliasValidatorInvalidAliasRe);
    });
  });

  describe('#fetchRoles', () => {
    it('should validate for if the req path param contain account id and type', async () => {
      const result = await workflowValidator.fetchRoles(
        data.fetchRolesValidatorReq
      );
      expect(result).toEqual(data.fetchRolesValidatorRes);
    });
    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid id)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        workflowValidator.fetchRoles(data.fetchRolesValidatorInvalidIdReq)
      ).rejects.toThrow(data.fetchRolesValidatorInvalidIdRes);
    });
    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid type)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        workflowValidator.fetchRoles(data.fetchRolesValidatorInvalidTypeReq)
      ).rejects.toThrow(data.fetchRolesValidatorInvalidTypeRes);
    });
  });

  describe('#fetchUsersForRoleId', () => {
    it('should validate for if the req path param contain account id and type', async () => {
      const result = await workflowValidator.fetchUsersForRoleId(
        data.fetchUsersForRoleIdValidatorReq
      );
      expect(result).toEqual(data.fetchUsersForRoleIdValidatorRes);
    });

    it('should throw a request validation error if request is invalid (invalid id)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        workflowValidator.fetchUsersForRoleId(
          data.fetchUsersForRoleIdValidatorInvalidIdReq
        )
      ).rejects.toThrow(data.fetchUsersForRoleIdValidatorInvalidIdRes);
    });
    it('should throw a request validation error if request is invalid (invalid roleId)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        workflowValidator.fetchUsersForRoleId(
          data.fetchUsersForRoleIdValidatorInvalidRoleIdReq
        )
      ).rejects.toThrow(data.fetchUsersForRoleIdValidatorInvalidRoleIdRes);
    });
  });
});
