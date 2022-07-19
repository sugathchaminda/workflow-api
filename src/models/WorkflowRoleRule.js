/* eslint-disable no-restricted-globals */
const Model = require('../model');

const WorkflowRoleRuleModel = new Model(
  'workflow_role_rule as workflow_role_rule'
);

/**
 * @description Create role+rule association
 * @param Number roleId
 * @param Array rules
 * @return []
 */
WorkflowRoleRuleModel.createRoleRules = async (
  roleId,
  rules,
  transaction = null
) => {
  const roleRules = rules.map((rule) => ({
    workflow_role: roleId,
    workflow_rule: rule,
  }));

  const query = WorkflowRoleRuleModel.getQueryBuilder();

  if (transaction) {
    query.transacting(transaction);
  }

  query
    .insert(roleRules)
    .returning(['workflow_role_rule.id', 'workflow_role_rule.workflow_rule']);

  const results = await query;

  return results;
};

WorkflowRoleRuleModel.getRulesForRoleIds = async (roleIds) => {
  const response = await WorkflowRoleRuleModel.getQueryBuilder()
    .leftJoin(
      'workflow_role as workflow_role',
      'workflow_role.id',
      'workflow_role_rule.workflow_role'
    )
    .leftJoin(
      'workflow_rule as workflow_rule',
      'workflow_rule.id',
      'workflow_role_rule.workflow_rule'
    )
    .where('workflow_role.active', true)
    .whereIn('workflow_role_rule.workflow_role', roleIds)
    .select([
      'workflow_role_rule.id as role_rule_id',
      'workflow_rule.rule',
      'workflow_rule.rule_type',
    ]);

  return response;
};

module.exports = WorkflowRoleRuleModel;
