const toggleWorkflowReq = {
  params: {
    accountId: '1',
  },
};

const toggleWorkflowRes = {
  workflow: true,
};

const toggleWorkflowInvalidIdReq = {
  params: {
    accountId: 'one',
  },
};

// eslint-disable-next-line max-len
const toggleWorkflowInvalidIdRes = {
  message: 'Parse error: Invalid accountId',
  statusCode: 422,
};

const validateAliasReq = {
  params: {
    accountId: '1',
    alias: 'tester',
  },
};
const validateAliasInvalidIdReq = {
  params: {
    accountId: 'one',
    alias: 'tester',
  },
};
// eslint-disable-next-line max-len
const validateAliasInvalidIdRes = {
  message: 'Parse error: Invalid accountId',
  statusCode: 422,
};

const fetchRolesReq = {
  params: {
    accountId: '1',
    type: 'all',
  },
};

const fetchRolesRes = {
  roles: {
    general: [
      { id: 1, members: 1, name: 'admin' },
      { id: 2, members: 1, name: 'tester' },
      { id: 3, members: 0, name: 'developer' },
      { id: 4, members: 0, name: 'CTO' },
      { id: 5, members: 0, name: 'role edit' },
    ],
  },
};

const fetchRolesInvalidIdReq = {
  params: {
    accountId: 696,
    type: 'all',
  },
};

// eslint-disable-next-line max-len
const fetchRolesInvalidIdRes = {
  roles: { workflow: undefined, general: undefined },
};

const fetchRolesInvalidTypeReq = {
  params: {
    accountId: 696,
    type: 'none',
  },
};

// eslint-disable-next-line max-len
const fetchRolesInvalidTypeRes = {
  message: 'Un known role type',
  statusCode: 400,
};

const fetchRolesByIdReq = {
  params: {
    accountId: '1',
    roleId: '2',
  },
};

const fetchRolesByIdRes = [
  {
    countrycode: null,
    createdAt: null,
    demo_enabled: false,
    email: 'testuser@qvalia.se',
    id: 1,
    image_url: 'fb360de7-cde5-48d1-9c42-77171c7a7114.jpg',
    is_superadmin: false,
    language: 'en',
    name: 'John Doe',
    newsletters: true,
    password: 'testtest',
    phone: '+46704985196',
    schedule_reminders: false,
    scheduled_reminder_notification_days: [1],
    title: null,
    updatedAt: null,
    updates: true,
    verified_at: '2001-01-01T13:37:00.000Z',
    verified_mobile_at: '2001-01-01T13:37:00.000Z',
    workflow_role: 2,
  },
];

const fetchRolesByIdInvalidIdReq = {
  params: {
    accountId: 'one',
    roleId: '1',
  },
};

const fetchRolesByIdInvalidIdRes = {
  message: 'Parse error: Invalid accountId',
  statusCode: 422,
};

const fetchRolesByIdInvalidRoleReq = {
  params: {
    accountId: '1',
    roleId: '-2',
  },
};

const fetchRolesByIdInvalidRoleRes = {
  message: 'Role does not belong to the supplier',
  statusCode: 403,
};

module.exports = {
  toggleWorkflowReq,
  toggleWorkflowRes,
  toggleWorkflowInvalidIdReq,
  toggleWorkflowInvalidIdRes,
  validateAliasReq,
  validateAliasInvalidIdReq,
  validateAliasInvalidIdRes,
  fetchRolesReq,
  fetchRolesRes,
  fetchRolesInvalidIdReq,
  fetchRolesInvalidIdRes,
  fetchRolesInvalidTypeReq,
  fetchRolesInvalidTypeRes,
  fetchRolesByIdReq,
  fetchRolesByIdRes,
  fetchRolesByIdInvalidIdReq,
  fetchRolesByIdInvalidIdRes,
  fetchRolesByIdInvalidRoleReq,
  fetchRolesByIdInvalidRoleRes,
};
