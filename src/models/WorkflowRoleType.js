/* eslint-disable no-restricted-globals */
const Model = require('../model');

const WorkflowRoleTypeModel = new Model(
  'workflow_role_type as workflow_role_type'
);

WorkflowRoleTypeModel.ROLE_TYPES = {
  general: 'general',
  workflow: 'workflow',
};

WorkflowRoleTypeModel.getRoleType = async (type) => {
  const roleType = await WorkflowRoleTypeModel.getQueryBuilder()
    .where('workflow_role_type.type', type)
    .first();

  return roleType;
};

module.exports = WorkflowRoleTypeModel;
