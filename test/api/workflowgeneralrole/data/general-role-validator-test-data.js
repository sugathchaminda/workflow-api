const isRoleAvailableValidatorReq = {
  params: { accountId: '3' },
  query: { role: 'Testing General Roles' },
};

const isRoleAvailableValidatorRes = {
  accountId: '3',
  role: 'Testing General Roles',
};

const isRoleAvailableValidatorInvalidIdReq = {
  params: { accountId: 3 },
  query: { role: 'Testing General Roles' },
};

const isRoleAvailableValidatorInvalidIdRes = {
  message:
    'Request validation error: child "accountId" fails because ["accountId" must be a string]',
  statusCode: 422,
};

const isRoleAvailableValidatorInvalidRoleReq = {
  params: { accountId: '3' },
  query: { role: '' },
};

const isRoleAvailableValidatorInvalidRoleRes = {
  message:
    'Request validation error: child "role" fails because ["role" is not allowed to be empty]',
  statusCode: 422,
};

const createRoleValidatorReq = {
  params: {
    accountId: '3',
  },
  body: {
    role: 'Testing General Roles',
    permissions: [2, 4],
  },
};

const createRoleValidatorRes = {
  accountId: '3',
  role: 'Testing General Roles',
  permissions: [2, 4],
};

const createRoleValidatorInvalidIdReq = {
  params: {
    accountId: 3,
  },
  body: {
    role: 'Testing General Roles',
    permissions: [2, 4],
  },
};

const createRoleValidatorInvalidIdRes = {
  message:
    'Request validation error: child "accountId" fails because ["accountId" must be a string]',
  statusCode: 422,
};
const createRoleValidatorInvalidRoleReq = {
  params: {
    accountId: '3',
  },
  body: {
    role: '',
    permissions: [2, 4],
  },
};

const createRoleValidatorInvalidRoleRes = {
  message:
    'Request validation error: child "role" fails because ["role" is not allowed to be empty]',
  statusCode: 422,
};

const editRoleValidatorReq = {
  params: {
    accountId: '3',
    roleId: '8',
  },
  body: {
    role: 'test edit validator',
    permissions: [2, 4],
  },
};

const editRoleValidatorRes = {
  accountId: '3',
  role: 'test edit validator',
  roleId: '8',
  permissions: [2, 4],
};

const editRoleValidatorInvalidIdReq = {
  params: {
    accountId: 3,
    roleId: '8',
  },
  body: {
    role: 'test edit validator',
    permissions: [2, 4],
  },
};

const editRoleValidatorInvalidIdRes = {
  message:
    'Request validation error: child "accountId" fails because ["accountId" must be a string]',
  statusCode: 422,
};

const editRoleValidatorInvalidRoleReq = {
  params: {
    accountId: 3,
    roleId: '',
  },
  body: {
    role: 'test edit validator',
    permissions: [2, 4],
  },
};

const editRoleValidatorInvalidRoleRes = {
  message:
    'Request validation error: child "accountId" fails because ["accountId" must be a string].'
    + ' child "roleId" fails because ["roleId" is not allowed to be empty]',
  statusCode: 422,
};

const deleteRoleValidatorReq = {
  params: {
    accountId: '3',
    roleId: '12',
  },
};

const deleteRoleValidatorRes = { accountId: '3', roleId: '12' };

const deleteRoleValidatorInvalidIdReq = {
  params: {
    accountId: 3,
    roleId: '12',
  },
};
const deleteRoleValidatorInvalidIdRes = {
  message:
    'Request validation error: child "accountId" fails because ["accountId" must be a string]',
  statusCode: 422,
};
const deleteRoleValidatorInvalidRoleReq = {
  params: {
    accountId: '3',
    roleId: '',
  },
};
const deleteRoleValidatorInvalidRoleRes = {
  message:
    'Request validation error: child "roleId" fails because ["roleId" is not allowed to be empty]',
  statusCode: 422,
};

module.exports = {
  isRoleAvailableValidatorReq,
  isRoleAvailableValidatorRes,
  isRoleAvailableValidatorInvalidIdReq,
  isRoleAvailableValidatorInvalidIdRes,
  isRoleAvailableValidatorInvalidRoleReq,
  isRoleAvailableValidatorInvalidRoleRes,
  createRoleValidatorReq,
  createRoleValidatorRes,
  createRoleValidatorInvalidIdReq,
  createRoleValidatorInvalidIdRes,
  createRoleValidatorInvalidRoleReq,
  createRoleValidatorInvalidRoleRes,
  editRoleValidatorReq,
  editRoleValidatorRes,
  editRoleValidatorInvalidIdReq,
  editRoleValidatorInvalidIdRes,
  editRoleValidatorInvalidRoleReq,
  editRoleValidatorInvalidRoleRes,
  deleteRoleValidatorReq,
  deleteRoleValidatorRes,
  deleteRoleValidatorInvalidIdReq,
  deleteRoleValidatorInvalidIdRes,
  deleteRoleValidatorInvalidRoleReq,
  deleteRoleValidatorInvalidRoleRes,
};
