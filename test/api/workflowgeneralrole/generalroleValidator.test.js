/* eslint-disable no-undef */
const generalRoleValidator = require('../../../src/api/generalrole/generalroleValidation');

const data = require('./data/general-role-validator-test-data');

const knex = require('../../../src/db.js');

afterAll(() => knex.destroy());

describe('General role validation test suite', () => {
  describe('#isRoleAvailable', () => {
    it('should validate that a role is avaialble given a accountId and a role', async () => {
      const result = await generalRoleValidator.isRoleAvailableValidation(
        data.isRoleAvailableValidatorReq
      );
      expect(result).toEqual(data.isRoleAvailableValidatorRes);
    });

    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid id)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        generalRoleValidator.isRoleAvailableValidation(
          data.isRoleAvailableValidatorInvalidIdReq
        )
      ).rejects.toThrow(data.isRoleAvailableValidatorInvalidIdRes);
    });

    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid role)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        generalRoleValidator.isRoleAvailableValidation(
          data.isRoleAvailableValidatorInvalidRoleReq
        )
      ).rejects.toThrow(data.isRoleAvailableValidatorInvalidRoleRes);
    });
  });

  describe('#createRole', () => {
    it('should create a new general role for an account based on accountId and new role name', async () => {
      const result = await generalRoleValidator.createGeneralRoleValidation(
        data.createRoleValidatorReq
      );
      expect(result).toEqual(data.createRoleValidatorRes);
    });

    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid id)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        generalRoleValidator.createGeneralRoleValidation(
          data.createRoleValidatorInvalidIdReq
        )
      ).rejects.toThrow(data.createRoleValidatorInvalidIdRes);
    });
    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid role)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        generalRoleValidator.createGeneralRoleValidation(
          data.createRoleValidatorInvalidRoleReq
        )
      ).rejects.toThrow(data.createRoleValidatorInvalidRoleRes);
    });
  });

  describe('#editRole', () => {
    it('should edit a new general role for an account based on accountId and roleId', async () => {
      const result = await generalRoleValidator.editGeneralRoleValidation(
        data.editRoleValidatorReq
      );
      expect(result).toEqual(data.editRoleValidatorRes);
    });

    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid id)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        generalRoleValidator.editGeneralRoleValidation(
          data.editRoleValidatorInvalidIdReq
        )
      ).rejects.toThrow(data.editRoleValidatorInvalidIdRes);
    });
    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid role)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        generalRoleValidator.editGeneralRoleValidation(
          data.editRoleValidatorInvalidRoleReq
        )
      ).rejects.toThrow(data.editRoleValidatorInvalidRoleRes);
    });
  });

  describe('#deleteRole', () => {
    it('should delete a general role based on an accountId and roleId', async () => {
      const result = await generalRoleValidator.deleteGeneralRoleValidation(
        data.deleteRoleValidatorReq
      );
      expect(result).toEqual(data.deleteRoleValidatorRes);
    });

    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (invalid id)', async () => {
      // eslint-disable-next-line jest/valid-expect

      await expect(
        generalRoleValidator.deleteGeneralRoleValidation(
          data.deleteRoleValidatorInvalidIdReq
        )
      ).rejects.toThrow(data.deleteRoleValidatorInvalidIdRes);
    });
    // eslint-disable-next-line jest/no-focused-tests
    it('should throw a request validation error if request is invalid (role id)', async () => {
      // eslint-disable-next-line jest/valid-expect
      await expect(
        generalRoleValidator.deleteGeneralRoleValidation(
          data.deleteRoleValidatorInvalidRoleReq
        )
      ).rejects.toThrow(data.deleteRoleValidatorInvalidRoleRes);
    });
  });
});
