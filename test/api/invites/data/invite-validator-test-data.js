const addInviteWorkflowAndAliasReq = {
  params: {
    accountId: '1',
  },
  body: {
    inviteId: 1,
    workflow: {
      workflowRole: null,
      generalRole: [5],
      workflowAlias: ['tester'],
    },
  },
};

const addInviteWorkflowAndAliasRes = {
  accountId: '1',
  inviteId: 1,
  workflow: {
    workflowRole: null,
    generalRole: [5],
    workflowAlias: ['tester'],
  },
};

const addInviteWorkflowAndAliasInvalidIdReq = {
  params: {
    accountId: 1,
  },
  body: {
    inviteId: 1,
    workflow: {
      workflowRole: null,
      generalRole: [5],
      workflowAlias: ['tester'],
    },
  },
};

const addInviteWorkflowAndAliasInvalidIdRes = {
  message: 'Request validation error: accountId is required',
  statusCode: 442,
};

const addInviteWorkflowAndAliasInvalidInviteReq = {
  params: {
    accountId: '1',
  },
  body: {
    inviteId: 'one',
    workflow: {
      workflowRole: null,
      generalRole: [5],
      workflowAlias: ['tester'],
    },
  },
};

const addInviteWorkflowAndAliasInvalidInviteRes = {
  message: 'Request validation error: inviteId should be a number',
  statusCode: 442,
};

const fetchInviteWorkflowInfoReq = {
  params: {
    accountId: '1',
  },
  body: {
    ids: [1],
  },
};

const fetchInviteWorkflowInfoRes = { accountId: '1', inviteIds: [1] };

const fetchInviteWorkflowInfoInvalidIdReq = {
  params: {
    accountId: 1,
  },
  body: {
    ids: [1],
  },
};

const fetchInviteWorkflowInfoInvalidIdRes = {
  message: 'Request validation error: accountId is required',
  statusCode: 442,
};

const fetchInviteWorkflowInfoInvalidIdsReq = {
  params: {
    accountId: '1',
  },
  body: {
    ids: ['one'],
  },
};

const fetchInviteWorkflowInfoInvalidIdsRes = {
  message: 'Request validation error: ids should be a number array',
  statusCode: 442,
};

const deleteInviteWorkflowInfoReq = {
  params: {
    accountId: '1',
    inviteId: '1',
  },
};

const deleteInviteWorkflowInfoRes = {
  accountId: '1',
  inviteId: '1',
};

const deleteInviteWorkflowInfoInvalidIdReq = {
  params: {
    accountId: 1,
    inviteId: '1',
  },
};

const deleteInviteWorkflowInfoInvalidIdRes = {
  message: 'Request validation error: accountId is required',
  statusCode: 442,
};

const deleteInviteWorkflowInfoInvalidInviteReq = {
  params: {
    accountId: '1',
    inviteId: 1,
  },
};

const deleteInviteWorkflowInfoInvalidInviteRes = {
  message: 'Request validation error: inviteId should be a number',
  statusCode: 442,
};

const addWorkflowInfoForAcceptedUserReq = {
  params: {
    accountId: '1',
  },
  body: {
    invitedId: 1,
    userId: 1,
  },
};

const addWorkflowInfoForAcceptedUserRes = { accountId: '1', userId: 1 };

const addWorkflowInfoForAcceptedUserInvalidIdReq = {
  params: {
    accountId: 1,
  },
  body: {
    invitedId: 1,
    userId: 1,
  },
};

const addWorkflowInfoForAcceptedUserInvalidIdRes = {
  message: 'Request validation error: accountId is required',
  statusCode: 442,
};

const addWorkflowInfoForAcceptedUserInvalidInviteReq = {
  params: {
    accountId: '1',
  },
  body: {
    invitedId: 'one',
    userId: 'one',
  },
};

const addWorkflowInfoForAcceptedUserInvalidInviteRes = {
  message: 'Request validation error: userId should be a number',
  statusCode: 442,
};

module.exports = {
  addInviteWorkflowAndAliasReq,
  addInviteWorkflowAndAliasRes,
  addInviteWorkflowAndAliasInvalidIdReq,
  addInviteWorkflowAndAliasInvalidIdRes,
  addInviteWorkflowAndAliasInvalidInviteReq,
  addInviteWorkflowAndAliasInvalidInviteRes,
  fetchInviteWorkflowInfoReq,
  fetchInviteWorkflowInfoRes,
  fetchInviteWorkflowInfoInvalidIdReq,
  fetchInviteWorkflowInfoInvalidIdRes,
  fetchInviteWorkflowInfoInvalidIdsReq,
  fetchInviteWorkflowInfoInvalidIdsRes,
  deleteInviteWorkflowInfoReq,
  deleteInviteWorkflowInfoRes,
  deleteInviteWorkflowInfoInvalidIdReq,
  deleteInviteWorkflowInfoInvalidIdRes,
  deleteInviteWorkflowInfoInvalidInviteReq,
  deleteInviteWorkflowInfoInvalidInviteRes,
  addWorkflowInfoForAcceptedUserReq,
  addWorkflowInfoForAcceptedUserRes,
  addWorkflowInfoForAcceptedUserInvalidIdReq,
  addWorkflowInfoForAcceptedUserInvalidIdRes,
  addWorkflowInfoForAcceptedUserInvalidInviteReq,
  addWorkflowInfoForAcceptedUserInvalidInviteRes,
};
