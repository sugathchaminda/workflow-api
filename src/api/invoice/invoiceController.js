const controller = require('../../controller');
const invoiceValidation = require('./invoiceValidation');
const invoiceService = require('./invoiceService');

const assignUser = async (req, res) => {
  await controller(req, res, {
    validator: invoiceValidation.assignUser,
    service: invoiceService.assignUser,
  });
};

const approveInvoice = async (req, res) => {
  await controller(req, res, {
    validator: invoiceValidation.approveInvoice,
    service: invoiceService.approveInvoice,
  });
};

const getInvoicesAssignedToMe = async (req, res) => {
  await controller(req, res, {
    validator: invoiceValidation.getInvoicesAssignedToMe,
    service: invoiceService.getInvoicesAssignedToMe,
  });
};

const getInvoice = async (req, res) => {
  await controller(req, res, {
    validator: invoiceValidation.getInvoice,
    service: invoiceService.getInvoice,
  });
};

const cancelInvoice = async (req, res) => {
  await controller(req, res, {
    validator: invoiceValidation.cancelInvoice,
    service: invoiceService.cancelInvoice,
  });
};

const holdInvoice = async (req, res) => {
  await controller(req, res, {
    validator: invoiceValidation.holdInvoice,
    service: invoiceService.holdInvoice,
  });
};

const getUnassignedInvoices = async (req, res) => {
  await controller(req, res, {
    validator: invoiceValidation.getUnassignedInvoices,
    service: invoiceService.getUnassignedInvoices,
  });
};

const reassignInvoice = async (req, res) => {
  await controller(req, res, {
    validator: invoiceValidation.reassignInvoice,
    service: invoiceService.reassignInvoice,
  });
};

const releaseInvoice = async (req, res) => {
  await controller(req, res, {
    validator: invoiceValidation.releaseInvoice,
    service: invoiceService.releaseInvoice,
  });
};

const signInvoice = async (req, res) => {
  await controller(req, res, {
    validator: invoiceValidation.signInvoice,
    service: invoiceService.signInvoice,
  });
};

const getInvoicePermissions = async (req, res) => {
  await controller(req, res, {
    validator: invoiceValidation.signInvoice,
    service: invoiceService.getInvoicePermissions,
  });
};

const getAssignableUsers = async (req, res) => {
  await controller(req, res, {
    validator: invoiceValidation.getAssignableUsers,
    service: invoiceService.getAssignableUsers,
  });
};

const assignUnassignedInvoice = async (req, res) => {
  await controller(req, res, {
    validator: invoiceValidation.assignUnassignedInvoice,
    service: invoiceService.assignUnassignedInvoice,
  });
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
