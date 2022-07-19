const fetchUserAndAliasesValidatorReq = {
  body: { ids: [62] },
  params: { accountId: '3' },
};
const fetchUserAndAliasesValidatorRes = { accountId: '3', userIds: [62] };
const fetchUserAndAliasesValidatorInvalidIdsReq = {
  body: { ids: ['sixty two'] },
  params: { accountId: '3' },
};
const fetchUserAndAliasesValidatorInvalidIdsRes = {
  message: 'Request validation error: ids should be a number array',
  statusCode: 442,
};
const fetchUserAndAliasesValidatorInvalidIdReq = {
  body: { ids: [62] },
  params: { accountId: 3 },
};
const fetchUserAndAliasesValidatorInvalidIdRes = {
  message: 'Request validation error: account id is required',
  statusCode: 442,
};
const updateUserAndAliasesValidatorReq = {
  user: {
    id: 62,
  },
  params: {
    accountId: '3',
    userId: 62,
  },
  body: {
    workflowRole: 4,
    generalRole: [2, 3],
    workflowAlias: ['admin', 'tester'],
  },
  headers: {
    cookie:
      'sails.sid=s%3AYgBprG7hMkwwTofQBoCrxRbGGZV-GyB-.WiTrU56JLgwwoqdo5n%2BSIGW%2BXxoa1qrEh5X499HiWfc',
  },
};

const updateUserAndAliasesValidatorRes = {
  accountId: '3',
  authUser: 62,
  cookie:
    'sails.sid=s%3AYgBprG7hMkwwTofQBoCrxRbGGZV-GyB-.WiTrU56JLgwwoqdo5n%2BSIGW%2BXxoa1qrEh5X499HiWfc',
  workflowRole: 4,
  generalRole: [2, 3],
  userId: 62,
  workflowAlias: ['admin', 'tester'],
};

const updateUserAndAliasesValidatorInvalidIdReq = {
  user: {
    id: 62,
  },
  params: {
    accountId: '',
    userId: 62,
  },
  body: {
    workflowRole: 4,
    generalRole: [2, 3],
    workflowAlias: ['admin', 'tester'],
  },
  headers: {
    cookie:
      'sails.sid=s%3AYgBprG7hMkwwTofQBoCrxRbGGZV-GyB-.WiTrU56JLgwwoqdo5n%2BSIGW%2BXxoa1qrEh5X499HiWfc',
  },
};

const updateUserAndAliasesValidatorInvalidIdRes = {
  message: 'Request validation error: account id is required',
  statusCode: 442,
};

const updateUserAndAliasesValidatorInvalidUserReq = {
  user: {
    id: 62,
  },
  params: {
    accountId: '3',
    userId: 'sixty two',
  },
  body: {
    workflowRole: 4,
    generalRole: [2, 3],
    workflowAlias: ['admin', 'tester'],
  },
  headers: {
    cookie:
      'sails.sid=s%3AYgBprG7hMkwwTofQBoCrxRbGGZV-GyB-.WiTrU56JLgwwoqdo5n%2BSIGW%2BXxoa1qrEh5X499HiWfc',
  },
};

const updateUserAndAliasesValidatorInvalidUserRes = {
  message: 'Request validation error: User id should be a number',
  statusCode: 442,
};

const updateUserAndAliasesValidatorInvalidWorkflowIdReq = {
  user: {
    id: 62,
  },
  params: {
    accountId: '3',
    userId: 62,
  },
  body: {
    workflowRole: 'four',
    generalRole: [2, 3],
    workflowAlias: ['admin', 'tester'],
  },
  headers: {
    cookie:
      'sails.sid=s%3AYgBprG7hMkwwTofQBoCrxRbGGZV-GyB-.WiTrU56JLgwwoqdo5n%2BSIGW%2BXxoa1qrEh5X499HiWfc',
  },
};

const updateUserAndAliasesValidatorInvalidWorkflowIdRes = {
  message:
    'Request validation error: child "workflowRole" fails because ["workflowRole" must be a number]',
  statusCode: 442,
};

const updateUserAndAliasesValidatorInvalidWorkflowRoleReq = {
  user: {
    id: 62,
  },
  params: {
    accountId: '3',
    userId: 62,
  },
  body: {
    workflowRole: 'four',
    generalRole: ['two'],
    workflowAlias: ['admin', 'tester'],
  },
  headers: {
    cookie:
      'sails.sid=s%3AYgBprG7hMkwwTofQBoCrxRbGGZV-GyB-.WiTrU56JLgwwoqdo5n%2BSIGW%2BXxoa1qrEh5X499HiWfc',
  },
};

const updateUserAndAliasesValidatorInvalidWorkflowRoleRes = {
  // eslint-disable-next-line max-len
  message:
    // eslint-disable-next-line max-len
    'Request validation error: child "workflowRole" fails because ["workflowRole" must be a number]. child "generalRole" fails because ["generalRole" at position 0 fails because ["0" must be a number]]',
  statusCode: 442,
};

const deleteUsersRolesAndAliasesValidatorReq = {
  params: {
    accountId: '3',
    userId: 62,
  },
  user: {
    id: 62,
  },
  headers: {
    cookie:
      'sails.sid=s%3AYgBprG7hMkwwTofQBoCrxRbGGZV-GyB-.WiTrU56JLgwwoqdo5n%2BSIGW%2BXxoa1qrEh5X499HiWfc',
  },
};

const deleteUsersRolesAndAliasesValidatorRes = {
  accountId: '3',
  authUser: 62,
  cookie:
    'sails.sid=s%3AYgBprG7hMkwwTofQBoCrxRbGGZV-GyB-.WiTrU56JLgwwoqdo5n%2BSIGW%2BXxoa1qrEh5X499HiWfc',
  userId: 62,
};

const deleteUsersRolesAndAliasesValidatorInvalidIdReq = {
  params: {
    accountId: 3,
    userId: 62,
  },
  user: {
    id: 62,
  },
  headers: {
    cookie:
      'sails.sid=s%3AYgBprG7hMkwwTofQBoCrxRbGGZV-GyB-.WiTrU56JLgwwoqdo5n%2BSIGW%2BXxoa1qrEh5X499HiWfc',
  },
};

const deleteUsersRolesAndAliasesValidatorInvalidIdRes = {
  message: 'Request validation error: account id is required',
  statusCode: 442,
};

const deleteUsersRolesAndAliasesValidatorInvalidUserReq = {
  params: {
    accountId: '3',
    userId: 'sixty two',
  },
  user: {
    id: 62,
  },
  headers: {
    cookie:
      'sails.sid=s%3AYgBprG7hMkwwTofQBoCrxRbGGZV-GyB-.WiTrU56JLgwwoqdo5n%2BSIGW%2BXxoa1qrEh5X499HiWfc',
  },
};

const deleteUsersRolesAndAliasesValidatorInvalidUserRes = {
  message: 'Request validation error: User id should be a number',
  statusCode: 442,
};

module.exports = {
  fetchUserAndAliasesValidatorReq,
  fetchUserAndAliasesValidatorRes,
  fetchUserAndAliasesValidatorInvalidIdsReq,
  fetchUserAndAliasesValidatorInvalidIdsRes,
  fetchUserAndAliasesValidatorInvalidIdReq,
  fetchUserAndAliasesValidatorInvalidIdRes,
  updateUserAndAliasesValidatorReq,
  updateUserAndAliasesValidatorRes,
  updateUserAndAliasesValidatorInvalidIdReq,
  updateUserAndAliasesValidatorInvalidIdRes,
  updateUserAndAliasesValidatorInvalidUserReq,
  updateUserAndAliasesValidatorInvalidUserRes,
  updateUserAndAliasesValidatorInvalidWorkflowIdReq,
  updateUserAndAliasesValidatorInvalidWorkflowIdRes,
  updateUserAndAliasesValidatorInvalidWorkflowRoleReq,
  updateUserAndAliasesValidatorInvalidWorkflowRoleRes,
  deleteUsersRolesAndAliasesValidatorReq,
  deleteUsersRolesAndAliasesValidatorRes,
  deleteUsersRolesAndAliasesValidatorInvalidIdReq,
  deleteUsersRolesAndAliasesValidatorInvalidIdRes,
  deleteUsersRolesAndAliasesValidatorInvalidUserReq,
  deleteUsersRolesAndAliasesValidatorInvalidUserRes,
};
