const assignUserReq = {
  params: {
    accountId: '25',
    invoiceId: 85,
  },
};

const assignUserRes = {
  email: 'testuser@qvalia.se',
  name: 'John Doe',
  id: 1,
};

const assignUserInvalidIdReq = {
  params: {
    accountId: 'one',
    invoiceId: 1,
  },
};

const assignUserInvalidIdRes = {
  message: 'Parse error: Invalid accountId',
  statusCode: 422,
};

const assignUserInvalidInvoiceReq = {
  params: {
    accountId: '1',
    invoiceId: 0,
  },
};

const assignUserInvalidInvoiceRes = {
  message: 'No invoice found with this ID',
  statusCode: 404,
};

const approveInvoiceReq = {
  accountId: 1,
  invoiceId: 2,
  status: 'ToApprove',
  user: {
    id: 1,
    workflowRole: {
      id: 2,
      parent: 1,
    },
  },
};

const approveInvoiceRes = { message: 'Invoice approved successfully' };

const approveInvoiceInvalidStatusReq = {
  accountId: 1,
  invoiceId: 2,
  status: 'Cancelled',
  user: {
    id: 1,
    workflowRole: {
      id: 2,
      parent: 1,
    },
  },
};

const approveInvoiceInvalidStatusRes = {
  message: 'Cancelled or locked invoices cannot be approved',
  statusCode: 403,
};

const approveInvoiceInvalidIdReq = {
  accountId: 'one',
  invoiceId: 2,
  user: {
    id: 1,
    workflowRole: {
      id: 2,
      parent: 1,
    },
  },
};

const approveInvoiceInvalidIdRes = {
  message: 'Parse error: Invalid accountId',
  statusCode: 422,
};

const approveInvoiceInvalidInvoiceReq = {
  accountId: '1',
  invoiceId: 0,
  user: {
    id: 1,
    workflowRole: {
      id: 2,
      parent: 1,
    },
  },
};

const approveInvoiceInvalidInvoiceRes = {
  message: 'No invoice found for this invoiceId',
  statusCode: 403,
};

const approveInvoiceInvalidRoleReq = {
  accountId: '1',
  invoiceId: 2,
  user: {
    id: 1,
    workflowRole: {
      id: 0,
      parent: 1,
    },
  },
};

const approveInvoiceInvalidRoleRes = {
  message: 'Invoice is not assigned to the user for approval',
  statusCode: 403,
};

const getInvoicesAssignedToMeReq = {
  accountId: '1',
  for: 'me',
  user: {
    id: 1,
    workflowRole: {
      id: 2,
      parent: 1,
    },
  },
};

const getInvoicesAssignedToMeRes = {
  me: {
    invoice_lines: 0,
    invoices_count: 0,
    invoices: [],
  },
};

const getInvoicesAssignedToMeInvalidIdReq = {
  accountId: 'one',
  for: 'me',
  user: {
    id: 1,
    workflowRole: {
      id: 2,
      parent: 1,
    },
  },
};

const getInvoicesAssignedToMeInvalidIdRes = {
  message: 'Parse error: Invalid accountId',
  statusCode: 422,
};

const reassignInvoiceReq = {
  params: {
    accountId: 25,
    invoiceId: 7,
    userId: 9,
    user: {
      id: 19,
    },
  },
};

const reassignInvoiceRes = { message: 'Invoice reassigned successfully' };

const reassignInvoiceInvalidStatusReq = {
  params: {
    accountId: 25,
    invoiceId: 85,
    userId: 9,
    user: {
      id: 9,
    },
  },
};

const reassignInvoiceInvalidStatusRes = {
  message: 'Cancelled or locked invoices cannot be reassigned',
  statusCode: 403,
};

const signInvoiceReq = {
  accountId: 25,
  invoiceId: 7,
  user: {
    id: 9,
    workflowRole: {
      id: 31,
      parent: 20,
    },
  },
  supplier: {
    workflowId: 1,
  },
};

const signInvoiceRes = { message: 'Invoice signed successfully' };

const signInvoiceInvalidIdReq = {
  accountId: 'one',
  invoiceId: 2,
  user: {
    id: 1,
    workflowRole: {
      id: 2,
      parent: 1,
    },
  },
  supplier: {
    workflowId: 1,
  },
};

const signInvoiceInvalidIdRes = {
  message: 'Parse error: Invalid accountId',
  statusCode: 422,
};

const signInvoiceInvalidInvoiceReq = {
  accountId: '1',
  invoiceId: 0,
  user: {
    id: 1,
    workflowRole: {
      id: 2,
      parent: 1,
    },
  },
  supplier: {
    workflowId: 1,
  },
};

const signInvoiceInvalidInvoiceRes = {
  message: 'No invoice found for this invoiceId',
  statusCode: 403,
};

const signInvoiceInvalidRoleReq = {
  accountId: '1',
  invoiceId: 2,
  user: {
    id: 1,
    workflowRole: {
      id: 0,
      parent: 1,
    },
  },
  supplier: {
    workflowId: 1,
  },
};

const signInvoiceInvalidRoleRes = {
  message: 'Invoice is not assigned to the user to sign',
  statusCode: 403,
};

const getUnassignedInvoicesReq = {
  accountId: '1',
};

const getUnassignedInvoicesRes = [
  {
    amount: '560',
    currency: 'SEK',
    invoice_id: 50,
    invoice_number: 'AAA-111-QIP-45',
    recieved_date: null,
    sender: undefined,
  },
  {
    amount: '560',
    currency: 'SEK',
    invoice_id: 53,
    invoice_number: 'AAA-111-QIP-71',
    recieved_date: null,
    sender: 'Test Automation Four AB',
  },
];

const getUnassignedInvoicesInvalidAccountIdReq = {
  accountId: 'test',
};

const getUnassignedInvoicesInvalidAccountIdRes = {
  message: 'Parse error: Invalid accountId',
  statusCode: 422,
};
const getAssignableUsersReq = {
  accountId: 1,
  invoiceId: 1,
  user: {
    id: 1,
    workflowRole: {
      id: 2,
      parent: 1,
    },
  },
};

const getAssignableUsersRes = {
  usersList: [
    {
      id: 9,
      email: 'testuser9@qvalia.se',
      phone: '+467049851951',
      name: 'TestAuto User 9',
      image_url: 'fb360de7-cde5-48d1-9c42-77171c7a7114.jpg',
      title: null,
      countrycode: null,
    },
    {
      id: 10,
      email: 'testuser10@qvalia.se',
      phone: '+4670498519510',
      name: 'TestAuto User 10',
      image_url: 'fb360de7-cde5-48d1-9c42-77171c7a7114.jpg',
      title: null,
      countrycode: null,
    },
  ],
};

const getAssignableUsersInvalidReq = {
  accountId: null,
  invoiceId: 0,
  user: {
    id: 1,
    workflowRole: {
      id: 2,
      parent: 1,
    },
  },
};

const getAssignableUsersInvalidRes = {
  message: 'Parse error: Invalid accountId',
  statusCode: 422,
};

const assignUnassignedInvoiceReq = {
  accountId: 1,
  invoiceId: 50,
  userId: 9,
  user: {
    id: 1,
    workflowRole: {
      id: 2,
      parent: 1,
    },
  },
  supplier: {
    workflowId: 1,
  },
};

const assignUnassignedInvoiceRes = {
  message: 'Invoice assigned successfully',
  statusCode: 200,
};

const assignUnassignedInvoiceInvalidInvoiceReq = {
  accountId: 1,
  invoiceId: 1,
  userId: 10,
  user: {
    id: 1,
    workflowRole: {
      id: 2,
      parent: 1,
    },
  },
  supplier: {
    workflowId: 1,
  },
};

const assignUnassignedInvoiceInvalidInvoiceRes = {
  message: 'No invoice found for this invoiceId',
  statusCode: 404,
};

const assignUnassignedInvoiceInvalidStateReq = {
  accountId: 1,
  invoiceId: 51,
  userId: 10,
  user: {
    id: 1,
    workflowRole: {
      id: 2,
      parent: 1,
    },
  },
  supplier: {
    workflowId: 1,
  },
};

const assignUnassignedInvoiceInvalidStateRes = {
  message: 'Invoice not in To Assign state to assign a user',
  statusCode: 403,
};

const assignUnassignedInvoiceNonWFUserReq = {
  accountId: 1,
  invoiceId: 51,
  userId: 5,
  user: {
    id: 1,
    workflowRole: {
      id: 2,
      parent: 1,
    },
  },
  supplier: {
    workflowId: 1,
  },
};

const assignUnassignedInvoiceNonWFUserRes = {
  message: 'Target user is not a workflow user',
  statusCode: 403,
};

const holdInvoiceReq = {
  accountId: 1,
  invoiceId: 51,
  user: {
    id: 10,
    workflowRole: {
      id: 7,
      parent: 1,
    },
    permissions: ['general_hold'],
  },
  supplier: {
    workflowId: 1,
  },
};

const holdInvoiceOwnInvoiceReq = {
  accountId: 1,
  invoiceId: 51,
  user: {
    id: 10,
    workflowRole: {
      id: 7,
      parent: 1,
    },
    permissions: ['workflow_hold'],
  },
  supplier: {
    workflowId: 1,
  },
};

const holdInvoiceRes = {
  message: 'Invoice hold successfully',
  statusCode: 200,
};

const holdInvoiceNotPermittedReq = {
  accountId: 1,
  invoiceId: 50,
  user: {
    id: 9,
    workflowRole: {
      id: 6,
      parent: 1,
    },
    permissions: ['workflow_hold'],
  },
  supplier: {
    workflowId: 1,
  },
};

const holdInvoiceNotPermittedRes = {
  error: 'Forbidden',
  message: 'User does not have permission to perform this action',
  statusCode: 403,
};

const holdInvoiceInvalidStateReq = {
  accountId: 1,
  invoiceId: 52,
  user: {
    id: 9,
    workflowRole: {
      id: 6,
      parent: 1,
    },
    permissions: ['general_hold'],
  },
  supplier: {
    workflowId: 1,
  },
};

const holdInvoiceInvalidStateRes = {
  error: 'Forbidden',
  message: 'Invoice cannot be put on hold',
  statusCode: 403,
};

const holdInvoiceInvalidWorkflowReq = {
  accountId: 1,
  invoiceId: 51,
  user: {
    id: 9,
    workflowRole: {
      id: 6,
      parent: 1,
    },
    permissions: ['general_hold'],
  },
  supplier: {
    workflowId: null,
  },
};

const holdInvoiceInvalidWorkflowRes = {
  error: 'Not Found',
  message: 'Workflow not found',
  statusCode: 404,
};

module.exports = {
  assignUserReq,
  assignUserRes,
  assignUserInvalidIdReq,
  assignUserInvalidIdRes,
  assignUserInvalidInvoiceReq,
  assignUserInvalidInvoiceRes,
  approveInvoiceReq,
  approveInvoiceRes,
  approveInvoiceInvalidStatusReq,
  approveInvoiceInvalidStatusRes,
  approveInvoiceInvalidIdReq,
  approveInvoiceInvalidIdRes,
  approveInvoiceInvalidInvoiceReq,
  approveInvoiceInvalidInvoiceRes,
  approveInvoiceInvalidRoleReq,
  approveInvoiceInvalidRoleRes,
  getInvoicesAssignedToMeReq,
  getInvoicesAssignedToMeRes,
  getInvoicesAssignedToMeInvalidIdReq,
  getInvoicesAssignedToMeInvalidIdRes,
  reassignInvoiceReq,
  reassignInvoiceRes,
  reassignInvoiceInvalidStatusReq,
  reassignInvoiceInvalidStatusRes,
  signInvoiceReq,
  signInvoiceRes,
  signInvoiceInvalidIdReq,
  signInvoiceInvalidIdRes,
  signInvoiceInvalidInvoiceReq,
  signInvoiceInvalidInvoiceRes,
  signInvoiceInvalidRoleReq,
  signInvoiceInvalidRoleRes,
  getUnassignedInvoicesReq,
  getUnassignedInvoicesRes,
  getUnassignedInvoicesInvalidAccountIdReq,
  getUnassignedInvoicesInvalidAccountIdRes,
  getAssignableUsersReq,
  getAssignableUsersRes,
  getAssignableUsersInvalidReq,
  getAssignableUsersInvalidRes,
  assignUnassignedInvoiceReq,
  assignUnassignedInvoiceRes,
  assignUnassignedInvoiceInvalidInvoiceReq,
  assignUnassignedInvoiceInvalidInvoiceRes,
  assignUnassignedInvoiceInvalidStateReq,
  assignUnassignedInvoiceInvalidStateRes,
  assignUnassignedInvoiceNonWFUserReq,
  assignUnassignedInvoiceNonWFUserRes,
  holdInvoiceReq,
  holdInvoiceRes,
  holdInvoiceOwnInvoiceReq,
  holdInvoiceNotPermittedReq,
  holdInvoiceNotPermittedRes,
  holdInvoiceInvalidStateReq,
  holdInvoiceInvalidStateRes,
  holdInvoiceInvalidWorkflowReq,
  holdInvoiceInvalidWorkflowRes,
};
