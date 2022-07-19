/* eslint-disable no-undef */
const userValidator = require('../../../src/api/users/userValidation');
const data = require('./data/user-validation-test-data');
const knex = require('../../../src/db.js');

afterAll(() => knex.destroy());

describe('User validation test suite', () => {
  describe('#fetchUsersRolesAndAliases', () => {
    it('should validate for if the req path param contain account id and req body contain ids number array', async () => {
      const result = await userValidator.fetchUsersRolesAndAliases(
        data.fetchUserAndAliasesValidatorReq
      );

      expect(result).toEqual(data.fetchUserAndAliasesValidatorRes);
    });
    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid array ids)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        userValidator.fetchUsersRolesAndAliases(
          data.fetchUserAndAliasesValidatorInvalidIdsReq
        )
      ).rejects.toThrow(data.fetchUserAndAliasesValidatorInvalidIdsRes);
    });
    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid id)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        userValidator.fetchUsersRolesAndAliases(
          data.fetchUserAndAliasesValidatorInvalidIdReq
        )
      ).rejects.toThrow(data.fetchUserAndAliasesValidatorInvalidIdRes);
    });
  });

  describe('#updateUsersRolesAndAliases', () => {
    // eslint-disable-next-line jest/no-focused-tests
    it('should validate for if the req path param contain account id, user id and body with the appropriate workflow attributes', async () => {
      const result = await userValidator.updateUsersRolesAndAliases(
        data.updateUserAndAliasesValidatorReq
      );

      expect(result).toEqual(data.updateUserAndAliasesValidatorRes);
    });

    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid id)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        userValidator.updateUsersRolesAndAliases(
          data.updateUserAndAliasesValidatorInvalidIdReq
        )
      ).rejects.toThrow(data.updateUserAndAliasesValidatorInvalidIdRes);
    });

    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid user)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        userValidator.updateUsersRolesAndAliases(
          data.updateUserAndAliasesValidatorInvalidUserReq
        )
      ).rejects.toThrow(data.updateUserAndAliasesValidatorInvalidUserRes);
    });

    // eslint-disable-next-line jest/no-disabled-tests
    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid workflow Id )', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        userValidator.updateUsersRolesAndAliases(
          data.updateUserAndAliasesValidatorInvalidWorkflowIdReq
        )
      ).rejects.toThrow(data.updateUserAndAliasesValidatorInvalidWorkflowIdRes);
    });

    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid workflow role)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        userValidator.updateUsersRolesAndAliases(
          data.updateUserAndAliasesValidatorInvalidWorkflowRoleReq
        )
      ).rejects.toThrow(
        data.updateUserAndAliasesValidatorInvalidWorkflowRoleRes
      );
    });
  });

  describe('#deleteUsersRolesAndAliases', () => {
    it('should validate for if the req path param contain account id, user id and body with the appropriate workflow attributes', async () => {
      const result = await userValidator.deleteUsersRolesAndAliases(
        data.deleteUsersRolesAndAliasesValidatorReq
      );

      expect(result).toEqual(data.deleteUsersRolesAndAliasesValidatorRes);
    });

    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid id)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        userValidator.deleteUsersRolesAndAliases(
          data.deleteUsersRolesAndAliasesValidatorInvalidIdReq
        )
      ).rejects.toThrow(data.deleteUsersRolesAndAliasesValidatorInvalidIdRes);
    });
    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid user)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        userValidator.deleteUsersRolesAndAliases(
          data.deleteUsersRolesAndAliasesValidatorInvalidUserReq
        )
      ).rejects.toThrow(data.deleteUsersRolesAndAliasesValidatorInvalidUserRes);
    });
  });
});
