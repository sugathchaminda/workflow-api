const addInviteWorkflowAndAliasReq = {
  accountId: '1',
  inviteId: 1,
  workflow: {
    workflowRole: null,
    generalRole: [3],
    workflowAlias: ['invite tester'],
  },
};

const addInviteWorkflowAndAliasRes = {
  roles: {
    workflow: {
      workflowRole: null,
      generalRole: [3],
      workflowAlias: ['invite tester'],
    },
    general: [],
  },
  alias: ['invire tester'],
};

const addInviteWorkflowAndAliasInvalidIdReq = {
  accountId: 'one',
  inviteId: 1,
  workflow: {
    workflowRole: null,
    generalRole: [3],
    workflowAlias: ['invite tester'],
  },
};

const addInviteWorkflowAndAliasInvalidIdRes = {
  message: 'Parse error: Invalid accountId',
  statusCode: 422,
};

const addInviteWorkflowAndAliasInvalidInviteReq = {
  accountId: 1,
  inviteId: 3,
  workflow: {
    workflowRole: null,
    generalRole: [3],
    workflowAlias: ['invite tester'],
  },
};

const addInviteWorkflowAndAliasInvalidInviteRes = {
  message: 'Invite is not valid',
  statusCode: 400,
};

const fetchInviteWorkflowInfoReq = { accountId: '1', inviteIds: [1] };

const fetchInviteWorkflowInfoRes = {
  1: {
    general_roles: [
      {
        id: 1,
        name: 'tester',
        roleId: 2,
      },
    ],
    invite_aliases: [
      {
        id: 1,
        text: 'invite test',
      },
    ],
    workflow_role: {},
  },
};

const fetchInviteWorkflowInfoInvalidIdsReq = {
  accountId: '1',
  inviteIds: ['3'],
};

const fetchInviteWorkflowInfoInvalidIdsRes = {
  3: {
    general_roles: [],
    invite_aliases: [],
    workflow_role: {},
  },
};

// this leads to a duplicate key in workflow_alias table which violates the unique key constraint, alternative baseline data suggestions welcome.
const addWorkflowInfoForAcceptedUserReq = {
  accountId: '1',
  inviteId: 2,
  userId: 2,
};

const addWorkflowInfoForAcceptedUserInvalidIdReq = {
  accountId: 'one',
  inviteId: 2,
  userId: 2,
};
const addWorkflowInfoForAcceptedUserInvalidIdRes = {
  message: 'Parse error: Invalid accountId',
  statusCode: 422,
};

const addWorkflowInfoForAcceptedUserInvalidInviteReq = {
  accountId: '1',
  inviteId: 3,
  userId: 2,
};
const addWorkflowInfoForAcceptedUserInvalidInviteRes = {
  insertedUserAliasResponse: [],
  insertedUserRolesResponse: [],
};

const deleteInviteWorkflowInfoReq = { accountId: '1', inviteId: '1' };

const deleteInviteWorkflowInfoRes = { message: 'Successfully Deleted' };

const deleteInviteWorkflowInfoInvalidIdReq = {
  accountId: 'one',
  inviteId: '1',
};

const deleteInviteWorkflowInfoInvalidIdRes = {
  message: 'Parse error: Invalid accountId',
  statusCode: 422,
};

const deleteInviteWorkflowInfoInvalidInviteReq = {
  accountId: '1',
  inviteId: '12',
};

const deleteInviteWorkflowInfoInvalidInviteRes = {
  message: 'Invite is not valid',
  statusCode: 400,
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
  fetchInviteWorkflowInfoInvalidIdsReq,
  fetchInviteWorkflowInfoInvalidIdsRes,
  addWorkflowInfoForAcceptedUserReq,
  addWorkflowInfoForAcceptedUserInvalidIdReq,
  addWorkflowInfoForAcceptedUserInvalidIdRes,
  addWorkflowInfoForAcceptedUserInvalidInviteReq,
  addWorkflowInfoForAcceptedUserInvalidInviteRes,
  deleteInviteWorkflowInfoReq,
  deleteInviteWorkflowInfoRes,
  deleteInviteWorkflowInfoInvalidIdReq,
  deleteInviteWorkflowInfoInvalidIdRes,
  deleteInviteWorkflowInfoInvalidInviteReq,
  deleteInviteWorkflowInfoInvalidInviteRes,
};
