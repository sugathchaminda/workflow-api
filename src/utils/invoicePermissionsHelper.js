const { InvoiceWorkflow } = require('../models/index');
const InvoiceActions = require('../enums/invoiceActions');
const workflowService = require('../api/workflow/workflowService');

const hasAssignPermission = (invoice, user, permissions) => {
  if (
    invoice.status === InvoiceWorkflow.STATUS.TO_ASSIGN
    && user.permissions.indexOf('general_assign') >= 0
  ) {
    permissions.push(InvoiceActions.assign);
  }
  return permissions;
};

const hasReassignPermission = async (invoice, user, permissions) => {
  if (
    invoice.status !== InvoiceWorkflow.STATUS.CANCELLED
    && invoice.status !== InvoiceWorkflow.STATUS.SIGNED
    && invoice.status !== InvoiceWorkflow.STATUS.SIGNED_LOCKED
  ) {
    if (
      user.permissions.indexOf('general_reassign') === -1
      && user.permissions.indexOf('workflow_reassign') >= 0
    ) {
      const isAssignedUserBelowTheUser = await workflowService.checkUserIsBelowAnotherUser(
        {
          accountId: invoice.supplier,
          topUser: user.id,
          belowUser: invoice.assigned_to,
        }
      );
      if (!isAssignedUserBelowTheUser && user.id !== invoice.assigned_to) {
        return permissions;
      }
      permissions.push(InvoiceActions.reassign);
    } else if (user.permissions.indexOf('general_reassign') >= 0) {
      permissions.push(InvoiceActions.reassign);
    }
  }
  return permissions;
};

const hasCancelPermission = async (invoice, user, permissions) => {
  if (
    invoice.status !== InvoiceWorkflow.STATUS.CANCELLED
    && invoice.status !== InvoiceWorkflow.STATUS.SIGNED_LOCKED
  ) {
    if (
      user.permissions.indexOf('general_cancel') === -1
      && user.permissions.indexOf('workflow_cancel') !== -1
    ) {
      const isAssignedUserBelowTheUser = await workflowService.checkUserIsBelowAnotherUser(
        {
          accountId: invoice.supplier,
          topUser: user.id,
          belowUser: invoice.assigned_to,
        }
      );
      if (
        !isAssignedUserBelowTheUser
        && user.id !== invoice.assigned_to
        && invoice.status !== InvoiceWorkflow.STATUS.TO_ASSIGN
      ) {
        return permissions;
      }
      permissions.push(InvoiceActions.cancel);
    } else if (user.permissions.indexOf('general_cancel') >= 0) {
      permissions.push(InvoiceActions.cancel);
    }
  }
  return permissions;
};

const hasHoldPermission = (invoice, user, permissions) => {
  if (
    invoice.status === InvoiceWorkflow.STATUS.TO_ASSIGN
    || invoice.status === InvoiceWorkflow.STATUS.TO_APPROVE
    || invoice.status === InvoiceWorkflow.STATUS.TO_SIGN
  ) {
    if (
      user.permissions.indexOf('general_hold') === -1
      && user.permissions.indexOf('workflow_hold') >= 0
      && invoice.assigned_to === user.id
      && invoice.status !== InvoiceWorkflow.STATUS.TO_ASSIGN
    ) {
      permissions.push(InvoiceActions.hold);
    } else if (user.permissions.indexOf('general_hold') >= 0) {
      permissions.push(InvoiceActions.hold);
    }
  }
  return permissions;
};

const hasReleasePermission = async (invoice, user, permissions) => {
  if (invoice.status === InvoiceWorkflow.STATUS.HOLD) {
    if (
      user.permissions.indexOf('general_hold') === -1
      && user.permissions.indexOf('workflow_hold') >= 0
    ) {
      const isAssignedUserBelowTheUser = await workflowService.checkUserIsBelowAnotherUser(
        {
          accountId: invoice.supplier,
          topUser: user.id,
          belowUser: invoice.assigned_to,
        }
      );
      if (!isAssignedUserBelowTheUser && user.id !== invoice.assigned_to) {
        return permissions;
      }
      permissions.push(InvoiceActions.release);
    } else if (user.permissions.indexOf('general_hold') >= 0) {
      permissions.push(InvoiceActions.release);
    }
  }
  return permissions;
};

const hasApprovePermission = async (invoice, user, permissions) => {
  if (
    invoice.status !== InvoiceWorkflow.STATUS.HOLD
    && invoice.status !== InvoiceWorkflow.STATUS.CANCELLED
    && invoice.status !== InvoiceWorkflow.STATUS.SIGNED_LOCKED
  ) {
    if (user.permissions.indexOf('workflow_approve') >= 0) {
      if (invoice.assigned_to === user.id) {
        permissions.push(InvoiceActions.approve);
      }

      return permissions;
    }
  }
  return permissions;
};

const hasSignPermission = (invoice, user, permissions) => {
  if (
    invoice.status !== InvoiceWorkflow.STATUS.HOLD
    && invoice.status !== InvoiceWorkflow.STATUS.CANCELLED
    && invoice.status !== InvoiceWorkflow.STATUS.SIGNED_LOCKED
  ) {
    if (
      user.permissions.indexOf('workflow_sign') >= 0
      && invoice.assigned_to === user.id
    ) {
      permissions.push(InvoiceActions.sign);
    }
  }
  return permissions;
};

module.exports = {
  hasAssignPermission,
  hasReassignPermission,
  hasCancelPermission,
  hasHoldPermission,
  hasReleasePermission,
  hasApprovePermission,
  hasSignPermission,
};
