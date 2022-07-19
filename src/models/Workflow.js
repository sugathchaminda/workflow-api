/* eslint-disable func-names */
/* eslint-disable no-restricted-globals */
const Model = require('../model');

const WorkflowModel = new Model('workflow as workflow');

// WorkflowModel Specific Functions (write the functions as member functions)
// ex: WorkflowModel.create = function () {} -> use normal function instead of arrow function
WorkflowModel.isEnabledForSupplier = async function (accountId) {
  if (isNaN(accountId)) {
    return false;
  }

  const response = await this.getQueryBuilder()
    .where('workflow.active', true)
    .where('workflow.supplier', accountId);

  return response.length > 0;
};

WorkflowModel.getSupplierActiveWorkflow = async (accountId) => {
  if (isNaN(accountId)) {
    return false;
  }

  const response = await WorkflowModel.getQueryBuilder()
    .where('workflow.active', true)
    .where('workflow.supplier', accountId);

  if (response.length === 0) {
    return false;
  }

  return response[0].id;
};

module.exports = WorkflowModel;
