const Joi = require('@hapi/joi');

const assignUser = () => Joi.object().keys({
  accountId: Joi.string().error(new Error('accountId is required')),
  invoiceId: Joi.number().error(new Error('invoiceId is required')),
});

const approveInvoice = () => Joi.object().keys({
  accountId: Joi.string().error(new Error('accountId is required')),
  invoiceId: Joi.number().error(new Error('invoiceId is required')),
});

const holdInvoice = () => Joi.object().keys({
  accountId: Joi.string().error(new Error('accountId is required')),
  invoiceId: Joi.number().error(new Error('invoiceId is required')),
});

const getInvoicesAssignedToMe = () => Joi.object().keys({
  accountId: Joi.string().required(),
  for: Joi.string().valid('ToApprove', 'ToSign', null),
});

const cancelInvoice = () => Joi.object().keys({
  accountId: Joi.string().error(new Error('accountId is required')),
  invoiceId: Joi.number().error(new Error('invoiceId is required')),
});

const getUnassignedInvoices = () => Joi.object().keys({
  accountId: Joi.string().required(),
});

const reassignInvoice = () => Joi.object().keys({
  accountId: Joi.string().required(),
  invoiceId: Joi.number().required(),
  userId: Joi.string().required(),
});

const releaseInvoice = () => Joi.object().keys({
  accountId: Joi.string().error(new Error('accountId is required')),
  invoiceId: Joi.number().error(new Error('invoiceId is required')),
});

const signInvoice = () => Joi.object().keys({
  accountId: Joi.string().error(new Error('accountId is required')),
  invoiceId: Joi.number().error(new Error('invoiceId is required')),
});

const getInvoicePermissions = () => Joi.object().keys({
  accountId: Joi.string().error(new Error('accountId is required')),
  invoiceId: Joi.number().error(new Error('invoiceId is required')),
});

const getAssignableUsers = () => Joi.object().keys({
  accountId: Joi.string().error(new Error('account id is required')),
  invoiceId: Joi.number().error(new Error('invoice id is required')),
});

module.exports = {
  assignUser,
  approveInvoice,
  getInvoicesAssignedToMe,
  cancelInvoice,
  holdInvoice,
  getUnassignedInvoices,
  reassignInvoice,
  releaseInvoice,
  signInvoice,
  getInvoicePermissions,
  getAssignableUsers,
};
