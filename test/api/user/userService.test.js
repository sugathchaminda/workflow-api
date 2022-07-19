const { beforeAll } = require('@jest/globals');
const userService = require('../../../src/api/users/userService');
const data = require('./data/user-service-test-data');

const knex = require('../../../src/db.js');

beforeAll(async () => {
  await knex('workflow_role')
    .update({
      name: 'the real role edit',
      role_type: 1,
      supplier: 1,
      parent: 0,
      active: true,
      sign_role: true,
    })
    .whereIn('id', [2]);
});

afterAll(async () => {
  await knex('workflow_role')
    .update({
      name: 'tester',
      role_type: 1,
      supplier: 1,
      parent: 0,
      active: true,
      sign_role: true,
    })
    .whereIn('id', [2]);
  await knex.destroy();
});

describe('User service test suite', () => {
  describe('#fetchUsersRolesAndAliases', () => {
    it('should return user array of object with role and alias information`', async () => {
      const result = await userService.fetchUsersRolesAndAliases(
        data.fetchUserRolesAndAliasReq
      );
      expect(result).toEqual(data.fetchUserRolesAndAliasRes);
    });
    it('should throw a request validation error if request is invalid (invalid id)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        userService.fetchUsersRolesAndAliases(
          data.fetchUserRolesAndAliasInvalidIdReq
        )
      ).rejects.toThrow(data.fetchUserRolesAndAliasInvalidIdRes);
    });
  });
  // any input with this test data will appreciated. Ran it locally passed but not on the build server. Possibly missing some seeding data.
  describe('#UpdateUsersRolesAndAliases', () => {
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('should return user array of object with role and alias information`', async () => {
      const result = await userService.updateUsersRolesAndAliases(
        data.updateUserRolesAndAliasesReq
      );
      expect(result).toEqual(data.updateUserRolesAndAliasesRes);
    });
    it('should throw a request validation error if request is invalid (invalid id)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        userService.updateUsersRolesAndAliases(
          data.updateUserRolesAndAliasesInvalidIdReq
        )
      ).rejects.toThrow(data.updateUserRolesAndAliasesInvalidIdRes);
    });
  });

  describe('#validateUserDelete', () => {
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('should return user array of object with role and alias information`', async () => {
      const result = await userService.validateUserDelete(
        data.validateUserDeleteReq
      );
      expect(result).toEqual(data.validateUserDeleteRes);
    });
    it('should throw a request validation error if request is invalid (invalid id)', async () => {
      // eslint-disable-next-line jest/valid-expect
      const result = await userService.validateUserDelete(
        data.validateUserDeleteReq
      );
      expect(result).toEqual(data.validateUserDeleteInvalidIdRes);
    });

    // eslint-disable-next-line jest/no-disabled-tests
    it('should throw a user not found if the user cannot be found', async () => {
      // eslint-disable-next-line jest/valid-expect
      const result = await userService.validateUserDelete(
        data.validateUserDeleteUserNotFoundReq
      );
      expect(result).toEqual(data.validateUserDeleteUserNotFoundRes);
    });
  });
});
