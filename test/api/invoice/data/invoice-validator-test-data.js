const assignUserValidatorReq = {
  params: {
    accountId: '1',
    invoiceId: 1,
  },
  headers: {
    authKey: '12345678',
  },
};

const assignUserValidatorRes = {
  accountId: '1',
  invoiceId: 1,
};

const assignUserValidatorInvalidIdReq = {
  params: {
    accountId: 1,
    invoiceId: 1,
  },
  headers: {
    cookie:
      'sails.sid=s%3AYgBprG7hMkwwTofQBoCrxRbGGZV-GyB-.WiTrU56JLgwwoqdo5n%2BSIGW%2BXxoa1qrEh5X499HiWfc',
  },
};

const assignUserValidatorInvalidIdRes = {
  message: 'Request validation error: accountId is required',
  statusCode: 422,
};

const assignUserValidatorInvalidInvoiceReq = {
  params: {
    accountId: '1',
    invoiceId: 'one',
  },
  headers: {
    cookie:
      'sails.sid=s%3AYgBprG7hMkwwTofQBoCrxRbGGZV-GyB-.WiTrU56JLgwwoqdo5n%2BSIGW%2BXxoa1qrEh5X499HiWfc',
  },
};

const assignUserValidatorInvalidInvoiceRes = {
  message: 'Request validation error: invoiceId is required',
  statusCode: 422,
};

const approveInvoiceValidatorReq = {
  params: {
    accountId: '1',
    invoiceId: 1,
  },
  user: {
    userId: 1,
    workflowRole: 'developer',
  },
  headers: {
    cookie:
      'sails.sid=s%3AYgBprG7hMkwwTofQBoCrxRbGGZV-GyB-.WiTrU56JLgwwoqdo5n%2BSIGW%2BXxoa1qrEh5X499HiWfc',
  },
};

const approveInvoiceValidatorRes = {
  accountId: '1',
  cookie:
    'sails.sid=s%3AYgBprG7hMkwwTofQBoCrxRbGGZV-GyB-.WiTrU56JLgwwoqdo5n%2BSIGW%2BXxoa1qrEh5X499HiWfc',
  invoiceId: 1,
  user: { userId: 1, workflowRole: 'developer' },
};
const approveInvoiceValidatorInvalidIdReq = {
  params: {
    accountId: 1,
    invoiceId: 1,
  },
  user: {
    userId: 1,
    workflowRole: 'developer',
  },
  headers: {
    cookie:
      'sails.sid=s%3AYgBprG7hMkwwTofQBoCrxRbGGZV-GyB-.WiTrU56JLgwwoqdo5n%2BSIGW%2BXxoa1qrEh5X499HiWfc',
  },
};

const approveInvoiceValidatorInvalidIdRes = {
  message: 'Request validation error: accountId is required',
  statusCode: 422,
};

const approveInvoiceValidatorInvalidInvoiceReq = {
  params: {
    accountId: '1',
    invoiceId: 'one',
  },
  user: {
    userId: 1,
    workflowRole: 'developer',
  },
  headers: {
    cookie:
      'sails.sid=s%3AYgBprG7hMkwwTofQBoCrxRbGGZV-GyB-.WiTrU56JLgwwoqdo5n%2BSIGW%2BXxoa1qrEh5X499HiWfc',
  },
};

const approveInvoiceValidatorInvalidInvoiceRes = {
  message: 'Request validation error: invoiceId is required',
  statusCode: 422,
};

const getInvoicesAssignedToMeReq = {
  params: {
    accountId: '1',
  },
  query: 'me',
  user: {
    userId: 1,
    workflowRole: 'developer',
  },
};

const getInvoicesAssignedToMeRes = {
  accountId: '1',
  for: null,
  user: { userId: 1, workflowRole: 'developer' },
};

const getInvoicesAssignedToMeInvalidIdReq = {
  params: {
    accountId: 1,
  },
  query: 'me',
  user: {
    userId: 1,
    workflowRole: 'developer',
  },
};

const getInvoicesAssignedToMeInvalidIdRes = {
  message:
    'Request validation error: child "accountId" fails because ["accountId" must be a string]',
  statusCode: 422,
};

const reassignInvoiceValidatorReq = {
  params: {
    accountId: '1',
    invoiceId: 1,
    userId: '1',
  },
  headers: {
    cookie:
      'sails.sid=s%3AYgBprG7hMkwwTofQBoCrxRbGGZV-GyB-.WiTrU56JLgwwoqdo5n%2BSIGW%2BXxoa1qrEh5X499HiWfc',
  },
};

const reassignInvoiceValidatorRes = {
  accountId: '1',
  invoiceId: 1,
  userId: '1',
};

const reassignInvoiceValidatorInvalidIdReq = {
  params: {
    accountId: 1,
    invoiceId: 1,
    userId: '1',
  },
  headers: {
    cookie:
      'sails.sid=s%3AYgBprG7hMkwwTofQBoCrxRbGGZV-GyB-.WiTrU56JLgwwoqdo5n%2BSIGW%2BXxoa1qrEh5X499HiWfc',
  },
};

const reassignInvoiceValidatorInvalidIdRes = {
  message:
    'Request validation error: child "accountId" fails because ["accountId" must be a string]',
  statusCode: 422,
};

const reassignInvoiceValidatorInvalidInvoiceReq = {
  params: {
    accountId: '1',
    invoiceId: 'one',
    userId: '1',
  },
  headers: {
    cookie:
      'sails.sid=s%3AYgBprG7hMkwwTofQBoCrxRbGGZV-GyB-.WiTrU56JLgwwoqdo5n%2BSIGW%2BXxoa1qrEh5X499HiWfc',
  },
};

const reassignInvoiceValidatorInvalidInvoiceRes = {
  message:
    'Request validation error: child "invoiceId" fails because ["invoiceId" must be a number]',
  statusCode: 422,
};

const reassignInvoiceValidatorInvalidUserReq = {
  params: {
    accountId: '1',
    invoiceId: 1,
    userId: 1,
  },
  headers: {
    cookie:
      'sails.sid=s%3AYgBprG7hMkwwTofQBoCrxRbGGZV-GyB-.WiTrU56JLgwwoqdo5n%2BSIGW%2BXxoa1qrEh5X499HiWfc',
  },
};

const reassignInvoiceValidatorInvalidUserRes = {
  message:
    'Request validation error: child "userId" fails because ["userId" must be a string]',
  statusCode: 422,
};

const unAssignedInvoicesValidatorReq = {
  params: {
    accountId: '25',
  },
  headers: {
    cookie:
      'sails.sid=s%3AYgBprG7hMkwwTofQBoCrxRbGGZV-GyB-.WiTrU56JLgwwoqdo5n%2BSIGW%2BXxoa1qrEh5X499HiWfc',
  },
};

const unAssignedInvoicesValidatorRes = {
  accountId: '25',
};

const unAssignedInvoicesInvalidAccountIdReq = {
  params: {
    accountId: 25,
  },
  headers: {
    cookie:
      'sails.sid=s%3AYgBprG7hMkwwTofQBoCrxRbGGZV-GyB-.WiTrU56JLgwwoqdo5n%2BSIGW%2BXxoa1qrEh5X499HiWfc',
  },
};

const unAssignedInvoicesInvalidAccountIdRes = {
  message:
    'Request validation error: child "accountId" fails because ["accountId" must be a string]',
  statusCode: 422,
};

module.exports = {
  assignUserValidatorReq,
  assignUserValidatorRes,
  assignUserValidatorInvalidIdReq,
  assignUserValidatorInvalidIdRes,
  assignUserValidatorInvalidInvoiceReq,
  assignUserValidatorInvalidInvoiceRes,
  approveInvoiceValidatorReq,
  approveInvoiceValidatorRes,
  approveInvoiceValidatorInvalidIdReq,
  approveInvoiceValidatorInvalidIdRes,
  approveInvoiceValidatorInvalidInvoiceReq,
  approveInvoiceValidatorInvalidInvoiceRes,
  getInvoicesAssignedToMeReq,
  getInvoicesAssignedToMeRes,
  getInvoicesAssignedToMeInvalidIdReq,
  getInvoicesAssignedToMeInvalidIdRes,
  reassignInvoiceValidatorReq,
  reassignInvoiceValidatorRes,
  reassignInvoiceValidatorInvalidIdReq,
  reassignInvoiceValidatorInvalidIdRes,
  reassignInvoiceValidatorInvalidInvoiceReq,
  reassignInvoiceValidatorInvalidInvoiceRes,
  reassignInvoiceValidatorInvalidUserReq,
  reassignInvoiceValidatorInvalidUserRes,
  unAssignedInvoicesValidatorReq,
  unAssignedInvoicesValidatorRes,
  unAssignedInvoicesInvalidAccountIdReq,
  unAssignedInvoicesInvalidAccountIdRes,
};
