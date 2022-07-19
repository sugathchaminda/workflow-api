const { clean, validate } = require('../../utils/validationHelper');
const schema = require('./invoiceSchema');

const assignUser = async (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    invoiceId: req.params.invoiceId,
    user: req.user,
    supplier: req.supplier,
    authKey: req.headers.authorization,
  });

  return validate(attributes, schema.assignUser);
};

const approveInvoice = async (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    invoiceId: req.params.invoiceId,
    user: req.user, // fetch user from cookie
    supplier: req.supplier,
    cookie: req.headers.cookie,
  });

  return validate(attributes, schema.approveInvoice);
};

const holdInvoice = async (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    invoiceId: req.params.invoiceId,
    user: req.user, // fetch user from cookie
    supplier: req.supplier,
    cookie: req.headers.cookie,
  });
  return validate(attributes, schema.holdInvoice);
};

const getInvoicesAssignedToMe = (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    for: req.query.for || null,
    user: req.user, // fetch user from cookie
  });

  return validate(attributes, schema.getInvoicesAssignedToMe);
};

const getInvoice = async (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    invoiceId: req.params.invoiceId,
    user: req.user, // fetch user from cookie
    supplier: req.supplier,
  });

  return validate(attributes, schema.approveInvoice);
};

const cancelInvoice = (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    invoiceId: req.params.invoiceId,
    user: req.user, // fetch user from cookie
    supplier: req.supplier,
  });

  return validate(attributes, schema.cancelInvoice);
};

const getUnassignedInvoices = (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
  });

  return validate(attributes, schema.getUnassignedInvoices);
};

const reassignInvoice = (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    invoiceId: req.params.invoiceId,
    userId: req.params.userId,
    user: req.user, // fetch user from cookie
    supplier: req.supplier,
  });

  return validate(attributes, schema.reassignInvoice);
};

const releaseInvoice = async (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    invoiceId: req.params.invoiceId,
    user: req.user, // fetch user from cookie
    supplier: req.supplier,
    cookie: req.headers.cookie,
  });

  return validate(attributes, schema.releaseInvoice);
};

const signInvoice = (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    invoiceId: req.params.invoiceId,
    user: req.user, // fetch user from cookie
    supplier: req.supplier,
    cookie: req.headers.cookie,
  });

  return validate(attributes, schema.signInvoice);
};

const getInvoicePermissions = (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    invoiceId: req.params.invoiceId,
    user: req.user, // fetch user from cookie
    supplier: req.supplier,
  });

  return validate(attributes, schema.getInvoicePermissions);
};

const getAssignableUsers = async (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    invoiceId: req.params.invoiceId,
    authUser: req.user.id,
  });

  return validate(attributes, schema.getAssignableUsers);
};

const assignUnassignedInvoice = (req) => {
  const attributes = clean({
    accountId: req.params.accountId,
    invoiceId: req.params.invoiceId,
    userId: req.params.userId,
    user: req.user, // fetch user from cookie
    supplier: req.supplier,
  });

  return validate(attributes, schema.reassignInvoice);
};

module.exports = {
  assignUser,
  approveInvoice,
  getInvoicesAssignedToMe,
  getInvoice,
  cancelInvoice,
  holdInvoice,
  getUnassignedInvoices,
  reassignInvoice,
  releaseInvoice,
  signInvoice,
  getInvoicePermissions,
  getAssignableUsers,
  assignUnassignedInvoice,
};
