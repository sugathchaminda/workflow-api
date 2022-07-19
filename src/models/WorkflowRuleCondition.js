/* eslint-disable no-restricted-globals */
const knex = require('../db');
const Model = require('../model');
const workflowRuleModel = require('./WorkflowRule');

const WorkflowRuleConditionModel = new Model(
  'workflow_rule_condition as workflow_rule_condition'
);

WorkflowRuleConditionModel.PRECEDENCE = {
  spending_limit: 1,
};

// Please refer to 20200820114229_add_workflow_rule_condition migration for type info.
WorkflowRuleConditionModel.TYPES = {
  spending_limit: {
    constraint: 'spending_limit',
    association: workflowRuleModel.WORKFLOW_ROLE_RULES.sign, // This can become an Array if this condtion associate with multiple rules. i.e: approve
  },
};

WorkflowRuleConditionModel.VALUES = {
  infinity: 'Infinity',
};

/**
 * @description Limit = null || undefined means there is no-limit.
 * @param {*} limit
 */
WorkflowRuleConditionModel.evalSpendingLimit = (limit) => (limit === null || limit === undefined
  ? WorkflowRuleConditionModel.VALUES.infinity
  : limit);

/**
 * @description Create rule conditions related to relevant role_rule.
 * @param [] roleRules
 * @param {} rules
 * @param [] conditions
 */
WorkflowRuleConditionModel.createRuleConditions = async (
  roleRules,
  rules,
  conditions,
  transaction = null
) => {
  const ruleConditions = conditions.map((condition) => {
    const conditionRule = condition.type.association;
    const ruleId = rules[conditionRule];

    const roleRuleId = roleRules.find(
      (roleRule) => roleRule.workflow_rule === ruleId
    );

    return {
      workflow_role_rule: roleRuleId.id,
      type: condition.type.constraint,
      value: condition.value,
      precedence: condition.precedense,
    };
  });

  const query = WorkflowRuleConditionModel.getQueryBuilder();

  if (transaction) {
    query.transacting(transaction);
  }

  await query.insert(ruleConditions);
};

/**
 * @description return conditions array related to a workflow role.
 * @param {*} options
 * @return []
 */
WorkflowRuleConditionModel.getWorkflowRoleConditions = (options = {}) => [
  {
    type: WorkflowRuleConditionModel.TYPES.spending_limit,
    value: options.spending_limit,
    precedense: WorkflowRuleConditionModel.PRECEDENCE.spending_limit,
  },
];

/**
 *
 * @param {Number} roleId
 * @param {String} type condition type. i.e: spending_limit
 * @return []
 */
WorkflowRuleConditionModel.getCondition = async (roleId, type) => {
  const results = await knex.raw(`
  select
    wrc.id,
    wrc.value
  from
    workflow_rule_condition wrc
  inner join workflow_role_rule wrr
  on wrr.id = wrc.workflow_role_rule
  where wrr.workflow_role = ${roleId}
  and wrc."type" = '${type}'
  `);

  return results.rows[0];
};

module.exports = WorkflowRuleConditionModel;
