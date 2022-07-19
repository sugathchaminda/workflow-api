const fetchUserRolesAndAliasReq = {
  accountId: 1,
  userIds: [1],
};

const fetchUserRolesAndAliasRes = [
  {
    userId: 1,
    workflowRole: {},
    generalRoles: [
      {
        id: 1,
        name: 'the real role edit',
        roleId: 2,
      },
    ],
    userAliases: [
      {
        id: 1,
        text: 'tester',
      },
      {
        id: 2,
        text: 'admin',
      },
    ],
  },
];

const fetchUserRolesAndAliasInvalidIdReq = {
  accountId: 'one',
  userIds: [1],
};

const fetchUserRolesAndAliasInvalidIdRes = {
  message: 'Parse error: Invalid accountId',
  statsusCode: 422,
};

const updateUserRolesAndAliasesReq = {
  accountId: 1,
  userId: 1,
  generalRole: [2, 3],
  workflowAlias: ['tester', 'admin'],
  user: {
    id: 1,
  },
  headers: {
    cookie:
      'sails.sid=s%3AYgBprG7hMkwwTofQBoCrxRbGGZV-GyB-.WiTrU56JLgwwoqdo5n%2BSIGW%2BXxoa1qrEh5X499HiWfc',
  },
};

const updateUserRolesAndAliasesRes = {
  alias: {},
  roles: {},
};

const updateUserRolesAndAliasesInvalidIdReq = {
  accountId: 'one',
  userId: 1,
  workflowRole: 1,
  generalRole: [2, 3],
  workflowAlias: ['admin', 'tester'],
  user: {
    id: 2,
  },
  headers: {
    cookie:
      'sails.sid=s%3AYgBprG7hMkwwTofQBoCrxRbGGZV-GyB-.WiTrU56JLgwwoqdo5n%2BSIGW%2BXxoa1qrEh5X499HiWfc',
  },
};

const updateUserRolesAndAliasesInvalidIdRes = {
  message: 'Parse error: Invalid accountId',
  statsusCode: 422,
};

const validateUserDeleteReq = {
  accountId: 1,
  userId: 1,
};

const validateUserDeleteRes = {
  roles: [1],
  aliases: [1, 2],
};

const validateUserDeleteInvalidIdReq = {
  accountId: 'one',
  userId: 1,
  user: {
    id: 2,
  },
  headers: {
    cookie:
      'sails.sid=s%3AYgBprG7hMkwwTofQBoCrxRbGGZV-GyB-.WiTrU56JLgwwoqdo5n%2BSIGW%2BXxoa1qrEh5X499HiWfc',
  },
};

const validateUserDeleteInvalidIdRes = {
  error: 'Not Found',
  message: 'User not found',
  statusCode: 404,
};

const validateUserDeleteUserNotFoundReq = {
  accountId: 1,
  userId: 99,
  user: {
    id: 99,
  },
  headers: {
    cookie:
      'sails.sid=s%3AYgBprG7hMkwwTofQBoCrxRbGGZV-GyB-.WiTrU56JLgwwoqdo5n%2BSIGW%2BXxoa1qrEh5X499HiWfc',
  },
};

const validateUserDeleteUserNotFoundRes = {
  error: 'Not Found',
  message: 'User not found',
  statusCode: 404,
};

module.exports = {
  fetchUserRolesAndAliasReq,
  fetchUserRolesAndAliasRes,
  fetchUserRolesAndAliasInvalidIdReq,
  fetchUserRolesAndAliasInvalidIdRes,
  updateUserRolesAndAliasesReq,
  updateUserRolesAndAliasesRes,
  updateUserRolesAndAliasesInvalidIdReq,
  updateUserRolesAndAliasesInvalidIdRes,
  validateUserDeleteReq,
  validateUserDeleteRes,
  validateUserDeleteInvalidIdReq,
  validateUserDeleteInvalidIdRes,
  validateUserDeleteUserNotFoundReq,
  validateUserDeleteUserNotFoundRes,
};
