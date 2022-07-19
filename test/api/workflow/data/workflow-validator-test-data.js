const accoutValidationReq = { params: { accountId: '3' } };
const accoutValidationRes = { accountId: '3' };
const accoutValidationInvalidReq = { params: { accountId: 3 } };
const accoutValidationInvalidRes = {
  message:
    'Request validation error: child "accountId" fails because ["accountId" must be a string]',
  statusCode: 422,
};

const validateAliasValidatorReq = {
  params: {
    accountId: '1',
  },
  query: {
    alias: 'test',
  },
};
const validateAliasValidatorRes = {
  accountId: '1',
  alias: 'test',
};

const validateAliasValidatorInvalidIdReq = {
  params: {
    accountId: 1,
  },
  query: {
    alias: 'test',
  },
};
const validateAliasValidatorInvalidIdRes = {
  message: 'Request validation error: account id is required',
  statusCode: 422,
};

const validateAliasValidatorInvalidAliasReq = {
  params: {
    accountId: '1',
  },
  query: {
    alias: 0,
  },
};
const validateAliasValidatorInvalidAliasRes = {
  message:
    'Request validation error: alias should be in a length between 1 to 50 char',
  statusCode: 422,
};

const fetchRolesValidatorReq = {
  params: {
    accountId: '1',
  },
  query: {
    type: 'all',
  },
};
const fetchRolesValidatorRes = {
  accountId: '1',
  type: 'all',
};

const fetchRolesValidatorInvalidIdReq = {
  params: {
    accountId: 1,
  },
  query: {
    type: 'all',
  },
};
const fetchRolesValidatorInvalidIdRes = {
  message: 'Request validation error: account id is required',
  statusCode: 422,
};

const fetchRolesValidatorInvalidTypeReq = {
  params: {
    accountId: '1',
  },
  query: {
    type: null,
  },
};
const fetchRolesValidatorInvalidTypeRes = {
  message:
    'Request validation error: type query param can be either all, workflow or general only',
  statusCode: 422,
};

const fetchUsersForRoleIdValidatorReq = {
  params: {
    accountId: '1',
    roleId: '4',
  },
};
const fetchUsersForRoleIdValidatorRes = {
  accountId: '1',
  roleId: '4',
};

const fetchUsersForRoleIdValidatorInvalidIdReq = {
  params: {
    accountId: 1,
    roleId: '4',
  },
};
const fetchUsersForRoleIdValidatorInvalidIdRes = {
  message: 'Request validation error: account id is required',
  statusCode: 422,
};

const fetchUsersForRoleIdValidatorInvalidRoleIdReq = {
  params: {
    accountId: '1',
    roleId: '',
  },
};
const fetchUsersForRoleIdValidatorInvalidRoleIdRes = {
  message: 'Request validation error: roleId should be a number',
  statusCode: 422,
};

module.exports = {
  accoutValidationReq,
  accoutValidationRes,
  accoutValidationInvalidReq,
  accoutValidationInvalidRes,
  validateAliasValidatorReq,
  validateAliasValidatorRes,
  validateAliasValidatorInvalidIdReq,
  validateAliasValidatorInvalidIdRes,
  validateAliasValidatorInvalidAliasReq,
  validateAliasValidatorInvalidAliasRes,
  fetchRolesValidatorReq,
  fetchRolesValidatorRes,
  fetchRolesValidatorInvalidIdReq,
  fetchRolesValidatorInvalidIdRes,
  fetchRolesValidatorInvalidTypeReq,
  fetchRolesValidatorInvalidTypeRes,
  fetchUsersForRoleIdValidatorReq,
  fetchUsersForRoleIdValidatorRes,
  fetchUsersForRoleIdValidatorInvalidIdReq,
  fetchUsersForRoleIdValidatorInvalidIdRes,
  fetchUsersForRoleIdValidatorInvalidRoleIdReq,
  fetchUsersForRoleIdValidatorInvalidRoleIdRes,
};
