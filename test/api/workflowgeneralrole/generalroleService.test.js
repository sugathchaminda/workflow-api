/* eslint-disable no-undef */
const generalroleService = require('../../../src/api/generalrole/generalroleService');
const data = require('./data/general-role-service-test-data');

const knex = require('../../../src/db.js');

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

describe('General role test suite', () => {
  describe('#isRoleAvailable', () => {
    // eslint-disable-next-line jest/expect-expect
    // eslint-disable-next-line jest/no-disabled-tests
    it('should check whether a role is available give an accountId and role name', async () => {
      const result = await generalroleService.isRoleAvailable(
        data.isRoleAvailableReq
      );
      expect(result).toEqual(data.isRoleAvailableRes);
    });

    it('should throw a request validation error if request is invalid (invalid id)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        generalroleService.isRoleAvailable(data.isRoleAvailableInvalidIdReq)
      ).rejects.toThrow(data.isRoleAvailableInvalidIdRes);
    });
  });

  describe('#createGeneralRole', () => {
    // eslint-disable-next-line jest/expect-expect
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('should validate a new general role for the accountid provided with role name and permissions', async () => {
      const result = await generalroleService.createRole(data.createRoleReq);
      expect(result).toEqual(data.createRoleRes);
    });

    it('should throw a request validation error if request is invalid (invalid id)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        generalroleService.createRole(data.createRoleInvalidIdReq)
      ).rejects.toThrow(data.createRoleInvalidIdRes);
    });

    // todo: if a role that already exists is being recreated it should give the apporpriate error message not duplicate key message with the whole query
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('should throw a request validation error if request is invalid (role already exists)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        generalroleService.createRole(data.createRoleReq)
      ).rejects.toThrow(data.createRoleExisting);
    });
  });

  // eslint-disable-next-line jest/no-disabled-tests
  describe('#editGeneralRole', () => {
    // eslint-disable-next-line jest/expect-expect
    it('should validate a new general role for the accountid provided with role name and permissions', async () => {
      const result = await generalroleService.editRole(data.editGeneralRoleReq);
      expect(result).toEqual(data.editGeneralRoleRes);
    });

    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid id)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        generalroleService.editRole(data.editGeneralRoleInvalidIdReq)
      ).rejects.toThrow(data.editGeneralRoleInvalidIdRes);
    });
    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid role)', async () => {
      const result = await generalroleService.editRole(
        data.editGeneralRoleInvalidRoleReq
      );
      expect(result).toEqual(data.editGeneralRoleInvalidRoleRes);
    });
  });
  describe('#deleteRole', () => {
    // eslint-disable-next-line jest/expect-expect
    // eslint-disable-next-line jest/no-disabled-tests
    it('should validate a new general role for the accountid provided with role name and permissions', async () => {
      const result = await generalroleService.deleteRole(
        data.deleteGeneralRoleReq
      );
      expect(result).toEqual(data.deleteGeneralRoleRes);
    });

    it('should throw a request validation error if request is invalid (invalid id)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        generalroleService.deleteRole(data.deleteGeneralRoleInvalidIdReq)
      ).rejects.toThrow(data.deleteGeneralRoleInvalidIdRes);
    });

    it('should throw a request validation error if request is invalid (invalid role)', async () => {
      // eslint-disable-next-line jest/valid-expect
      const result = await generalroleService.deleteRole(
        data.deleteGeneralRoleInvalidRoleReq
      );
      expect(result).toEqual(data.deleteGeneralRoleInvalidRoleRes);
    });
  });
});
