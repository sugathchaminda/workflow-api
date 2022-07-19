/* eslint-disable no-restricted-globals */
const Model = require('../model');
const WorkflowRoleTypeModel = require('./WorkflowRoleType');

const WorkflowRuleModel = new Model('workflow_rule as workflow_rule');

// Please refer to 20200820124147_populate_workflow_rules.js & 20200911115930_delete_redundent_workflow_rules.js migrations for rule info.
WorkflowRuleModel.WORKFLOW_ROLE_RULES = {
  sign: 'sign',
  reassign: 'reassign',
  hold: 'hold',
  cancel: 'cancel',
  approve: 'approve',
};

WorkflowRuleModel.getGeneraRolePermissionsByIds = async (permissions) => {
  const generalRolePermissions = await WorkflowRuleModel.getQueryBuilder()
    .where('workflow_rule.rule_type', WorkflowRoleTypeModel.ROLE_TYPES.general)
    .whereIn('workflow_rule.id', permissions)
    .select(['workflow_rule.id', 'workflow_rule.display_name']);

  return generalRolePermissions;
};

/**
 * @description Get top-level workflow role permisson id's (techincally all the permissions).
 * @return {}
 */
WorkflowRuleModel.getWorkflowRolePermissions = async () => {
  const workflowRolePermissions = await WorkflowRuleModel.getQueryBuilder()
    .where('workflow_rule.rule_type', WorkflowRoleTypeModel.ROLE_TYPES.workflow)
    .select(['workflow_rule.id', 'workflow_rule.rule']);

  return workflowRolePermissions.reduce(
    (map, permission) => {
      // eslint-disable-next-line no-param-reassign
      map.rules[permission.rule] = permission.id;
      map.ruleIds.push(permission.id);

      return map;
    },
    { rules: {}, ruleIds: [] }
  );
};

module.exports = WorkflowRuleModel;
