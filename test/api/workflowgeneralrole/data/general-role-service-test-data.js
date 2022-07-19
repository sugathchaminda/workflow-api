const isRoleAvailableReq = {
  accountId: 1,
  role: 'Test Role is Available',
};

const isRoleAvailableRes = {
  message: 'Role is available.',
  statusCode: 200,
};

const isRoleAvailableInvalidIdReq = {
  accountId: 'one',
  role: 'Test Role is Available',
};

const isRoleAvailableInvalidIdRes = {
  message: 'Parse error: Invalid accountId',
  statusCode: 422,
};

const createRoleReq = {
  accountId: 2,
  role: 'codeship create role test',
  permissions: [2, 4],
};

const createRoleRes = {
  id: 7,
  name: 'codeship create role test',
  members: 0,
  permissions: [
    { id: 2, permission: 'Re-Assign' },
    { id: 4, permission: 'Hold' },
  ],
};

const createRoleInvalidIdReq = {
  accountId: 'one',
  role: 'test data beta 6',
  permissions: [2, 4],
};

const createRoleInvalidIdRes = {
  message: 'Parse error: Invalid accountId',
  statusCode: 422,
};

const createRoleExisting = {
  statusCode: 409,
  error: 'Conflict',
  message: 'Role already exist.',
};

const editGeneralRoleReq = {
  accountId: 1,
  roleId: 2,
  role: 'the real role edit',
  permissions: [1, 2, 3, 4, 5],
};

const editGeneralRoleRes = {
  id: 2,
  name: 'the real role edit',
  permissions: [
    { id: 1, permission: 'Assign Un-Assigned Invoices' },
    { id: 2, permission: 'Re-Assign' },
    { id: 3, permission: 'Unassign Invoices' },
    { id: 4, permission: 'Hold' },
    { id: 5, permission: 'Cancel' },
  ],
};

const editGeneralRoleInvalidIdReq = {
  accountId: 'one',
  roleId: 2,
  role: 'the real role edit',
  permissions: [1, 2, 3, 4, 5],
};
const editGeneralRoleInvalidIdRes = {
  message: 'Parse error: Invalid accountId',
  statusCode: 422,
};

const editGeneralRoleInvalidRoleReq = {
  accountId: 1,
  roleId: 8,
  role: 'the role that does not exist',
  permissions: [1, 2, 3, 4, 5],
};
const editGeneralRoleInvalidRoleRes = {
  statusCode: 404,
  error: 'Not Found',
  message: 'Role not found.',
};

const deleteGeneralRoleReq = {
  accountId: 1,
  roleId: 2,
};

const deleteGeneralRoleRes = {
  message: 'Role is deleted.',
  statusCode: 200,
};

const deleteGeneralRoleInvalidIdReq = {
  accountId: 'one',
  roleId: 2,
};

const deleteGeneralRoleInvalidIdRes = {
  message: 'Parse error: Invalid accountId',
  statusCode: 422,
};
const deleteGeneralRoleInvalidRoleReq = {
  accountId: 1,
  roleId: 8888,
};

const deleteGeneralRoleInvalidRoleRes = {
  statusCode: 404,
  error: 'Not Found',
  message: 'Role not found.',
};

module.exports = {
  isRoleAvailableReq,
  isRoleAvailableRes,
  isRoleAvailableInvalidIdReq,
  isRoleAvailableInvalidIdRes,
  createRoleReq,
  createRoleRes,
  createRoleInvalidIdReq,
  createRoleInvalidIdRes,
  createRoleExisting,
  editGeneralRoleReq,
  editGeneralRoleRes,
  editGeneralRoleInvalidIdReq,
  editGeneralRoleInvalidIdRes,
  editGeneralRoleInvalidRoleReq,
  editGeneralRoleInvalidRoleRes,
  deleteGeneralRoleReq,
  deleteGeneralRoleRes,
  deleteGeneralRoleInvalidIdReq,
  deleteGeneralRoleInvalidIdRes,
  deleteGeneralRoleInvalidRoleReq,
  deleteGeneralRoleInvalidRoleRes,
};
