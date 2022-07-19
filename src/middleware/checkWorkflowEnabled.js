const errorHelper = require('../utils/errorHelper');
const { Workflow } = require('../models/index');

module.exports = async (req, res, next) => {
  const workflowId = await Workflow.getSupplierActiveWorkflow(
    req.params.accountId
  );
  if (!workflowId) {
    res.status(403).json(
      errorHelper({
        message: 'workflow feature is not enabled',
        statusCode: 403,
      }).payload
    );
  } else {
    req.supplier = { workflowId };
    next();
  }
};
