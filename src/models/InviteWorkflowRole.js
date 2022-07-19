/* eslint-disable camelcase */
/* eslint-disable func-names */
const Model = require('../model');
const ApplicationError = require('../utils/ApplicationError');

const InviteWorkflowRoleModel = new Model(
  'invite_workflow_role as invite_workflow_role'
);

// InviteWorkflowRoleModel Specific Functions (write the functions as member functions)
// ex: InviteWorkflowRoleModel.create = function () {} -> use normal function instead of arrow function

/**
 * @description Create Invite Workflow Role Record
 * @param {Arrat.<Object>} data
 */
InviteWorkflowRoleModel.create = async function (data) {
  // check whether the same invite id to role mapping exist
  const inviteAndRoleIds = data.map(({ invite, workflow_role }) => [
    invite,
    workflow_role,
  ]);
  const existingRecordsWithSameKeys = await this.getQueryBuilder().whereIn(
    ['invite', 'workflow_role'],
    inviteAndRoleIds
  );

  if (existingRecordsWithSameKeys.length > 0) {
    throw new ApplicationError({
      message: 'Invoice Workflow Role Already Exist',
      statusCode: 409,
    });
  }

  const response = await this.getQueryBuilder()
    .insert(data)
    .returning(['id', 'workflow_role']);

  return response;
};

/**
 * @description Gets number of users of a role
 * @param {Number} roleId
 * @returns {Number} memberCount
 */
InviteWorkflowRoleModel.getUserCountByRoleIds = async function (roles) {
  const userCounts = await this.getQueryBuilder()
    .whereIn('workflow_role', roles)
    .count('workflow_role')
    .groupBy('invite_workflow_role.workflow_role')
    .select(['invite_workflow_role.workflow_role']);

  return userCounts[0];
};

InviteWorkflowRoleModel.getInviteRoles = async function (inviteIds) {
  const response = await this.getQueryBuilder()
    .leftJoin(
      'workflow_role as workflow_role',
      'workflow_role.id',
      'invite_workflow_role.workflow_role'
    )
    .leftJoin(
      'workflow_role_type as workflow_role_type',
      'workflow_role_type.id',
      'workflow_role.role_type'
    )
    .whereIn('invite_workflow_role.invite', inviteIds)
    .select([
      'invite_workflow_role.id',
      'invite_workflow_role.invite',
      'invite_workflow_role.workflow_role',
      'workflow_role.name',
      'workflow_role_type.type',
    ]);

  return response;
};

InviteWorkflowRoleModel.removeByInviteId = async function (
  inviteId,
  transaction = null
) {
  let query = this.getQueryBuilder();
  if (transaction) {
    query = query.transacting(transaction);
  }
  const response = await query
    .where('invite_workflow_role.invite', inviteId)
    .del();

  return response;
};

InviteWorkflowRoleModel.fetchWorkflowRolesByInviteId = async function (
  inviteId
) {
  const response = await this.getQueryBuilder()
    .where('invite_workflow_role.invite', inviteId)
    .select(['invite_workflow_role.workflow_role']);

  // map to return ids array
  const workflowRoles = response.map((role) => role.workflow_role);

  return workflowRoles;
};

InviteWorkflowRoleModel.fetchInviteCountPerRoles = async function (roleIds) {
  const now = new Date().toUTCString();

  const response = await this.getQueryBuilder()
    .leftJoin('invite as invite', 'invite_workflow_role.invite', 'invite.id')
    .where('invite.valid_until', '>=', now)
    .whereIn('invite_workflow_role.workflow_role', roleIds)
    .select(['invite_workflow_role.workflow_role'])
    .groupBy('invite_workflow_role.workflow_role')
    .count(['invite_workflow_role.invite']);

  return response;
};

module.exports = InviteWorkflowRoleModel;
