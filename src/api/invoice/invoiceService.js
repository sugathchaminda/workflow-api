/* eslint-disable no-console */
const {
  IncomingInvoice,
  User,
  WorkflowAlias,
  UserWorkflowAlias,
  UserWorkflowRole,
  InvoiceWorkflow,
  InvoiceWorkflowHistory,
  WorkflowRuleCondition,
  WorkflowRoleType,
  Supplier,
  Workflow,
} = require('../../models');
const ApplicationError = require('../../utils/ApplicationError');
const { parseAccountId } = require('../../utils/parseHelper');
const FileService = require('../file/fileService');
const errorHelper = require('../../utils/errorHelper');
const knex = require('../../db');
const {
  writeTimelineLogs,
  writeTimelineLogsExternal,
  getTimelineEntry,
} = require('../../utils/timelineHelper');
const { enums } = require('../../enums/timelineEnums');
const workflowService = require('../workflow/workflowService');
const tagHelper = require('../../utils/tagHelper');
const {
  hasAssignPermission,
  hasReassignPermission,
  hasCancelPermission,
  hasHoldPermission,
  hasReleasePermission,
  hasApprovePermission,
  hasSignPermission,
} = require('../../utils/invoicePermissionsHelper');
const { autoPosting } = require('../accounting/accountingService');
const currencyConversionHelper = require('../../utils/currencyConversionHelper');
const { API, INTERNAL_BASE_API } = require('../../utils/apiHelper');
const { getSetCookie } = require('../../utils/cookieHelper');

const callQIPForWFStatusChange = async (
  status,
  accountId,
  invoiceId,
  attributes
) => {
  const uri = `${INTERNAL_BASE_API}/suppliers/${accountId}/incominginvoices/${invoiceId}/workflow_status/${status}`;
  const api = new API({
    method: 'PUT',
    uri,
  });

  return api.addCookie(getSetCookie(attributes)).send();
};

const assignUser = async (attributes) => {
  const accountId = parseAccountId(attributes.accountId);
  const invoiceId = parseInt(attributes.invoiceId, 10);
  const timelineEntries = [];

  // Fetch the incoming invoice
  const invoiceReceiverData = await IncomingInvoice.fetchInvoiceRecieverData(
    accountId,
    invoiceId
  );

  // Check whether the invoice is valid for the supplier
  if (invoiceReceiverData.length === 0) {
    throw new ApplicationError({
      message: 'No invoice found with this ID',
      statusCode: 404,
    });
  }

  // Check whether there is a workflow exist for the invoice
  const isWorkflowExist = await InvoiceWorkflow.isInvoiceWorkflowExistForInvoice(
    invoiceId
  );

  if (isWorkflowExist) {
    throw new ApplicationError({
      message: 'Invoice workflow already exist for the invoice',
      statusCode: 409,
    });
  }

  const receiverData = invoiceReceiverData[0].receiver_data;

  const invoiceReference = receiverData.reference && receiverData.reference.trim();

  let users = [];
  // find user with reference
  if (invoiceReference) {
    // fetch user by reference when reference is name
    users = await User.fetchUserByName(invoiceReference);
    // fetch user by reference when reference is alias
    // fetch by alias when users is empty
    if (users.length === 0) {
      const workflowAlias = await WorkflowAlias.fetchAliasByText(
        accountId,
        invoiceReference
      );

      if (workflowAlias) {
        const workflowAliasId = workflowAlias.id;

        // fetch user associated with the alias
        const userForAlias = await UserWorkflowAlias.fetchUserByAliasId(
          workflowAliasId
        );

        if (userForAlias) {
          const userObject = await User.fetchUserById(userForAlias.user);
          users = [userObject];
        }
      }
    }

    // If we have no users found with name | alias, try to find user reference with email
    if (users.length === 0) {
      // fetch user by email
      const userByEmail = await User.fetchUserByEmail(invoiceReference);

      if (userByEmail.length === 1) {
        users = userByEmail;
      }
    }
  }

  // Check whether the selected user is a workflow user
  let userWorkflowRole = null;
  if (users.length === 1) {
    const workflowUserRecord = await UserWorkflowRole.fetchUserWorkflowRole(
      accountId,
      users[0].id
    );

    userWorkflowRole = workflowUserRecord.length === 1
      ? workflowUserRecord[0].workflow_role
      : null;
  }

  const transaction = await knex.transaction();

  try {
    const { workflowId } = attributes.supplier;

    // if there is a user to assign the invoice to and if the user has a role in the workflow,
    // the invoice gets assigned to the particular user and the invoice goes to the 'ToApprove' status
    if (users.length === 1 && userWorkflowRole) {
      await InvoiceWorkflow.getQueryBuilder().transacting(transaction).insert({
        invoice: invoiceId,
        workflow_role: userWorkflowRole,
        assigned_to: users[0].id,
        status: InvoiceWorkflow.STATUS.TO_APPROVE,
        supplier: accountId,
      });

      // call QIP's relevant function to update status in `incominginvoice` table as well
      try {
        await callQIPForWFStatusChange(
          'unapprove',
          accountId,
          invoiceId,
          attributes
        );
      } catch (error) {
        console.log(
          'Calling QIP for workflow status change has failed: ',
          error
        );
      }

      // write to workflow history
      await InvoiceWorkflowHistory.create(
        workflowId,
        invoiceId,
        attributes.user ? attributes.user.id : null,
        null,
        InvoiceWorkflow.STATUS.TO_APPROVE,
        null,
        users[0].id,
        InvoiceWorkflowHistory.TYPE.STATUS_CHANGED,
        transaction
      );

      // write to invoice timeline
      const timelineAttributes = {
        status: InvoiceWorkflow.STATUS.TO_APPROVE,
        userId: attributes.user ? attributes.user.id : undefined,
        toUser: users[0].id,
      };
      const timelineEntry = await getTimelineEntry(
        timelineAttributes,
        enums.TIMELINE_INCOMINGINVOICE_WF_STATUS_CHANGED,
        invoiceId
      );
      timelineEntries.push(timelineEntry);
    } else {
      // if there is no user to assign the invoice to or if the user has no role in the workflow or both,
      // the invoice does not get assigned to a user and the invoice goes to the 'ToAssign' status
      await InvoiceWorkflow.getQueryBuilder().transacting(transaction).insert({
        invoice: invoiceId,
        workflow_role: null,
        assigned_to: null,
        status: InvoiceWorkflow.STATUS.TO_ASSIGN,
        supplier: accountId,
      });

      // write to workflow history
      await InvoiceWorkflowHistory.create(
        workflowId,
        invoiceId,
        attributes.user ? attributes.user.id : null,
        null,
        InvoiceWorkflow.STATUS.TO_ASSIGN,
        null,
        null,
        InvoiceWorkflowHistory.TYPE.STATUS_CHANGED,
        transaction
      );

      // write to invoice timeline
      const timelineAttributes = {
        status: InvoiceWorkflow.STATUS.TO_ASSIGN,
        userId: attributes.user ? attributes.user.id : undefined,
        toUser: null,
      };
      const timelineEntry = await getTimelineEntry(
        timelineAttributes,
        enums.TIMELINE_INCOMINGINVOICE_WF_STATUS_CHANGED,
        invoiceId
      );
      timelineEntries.push(timelineEntry);
    }

    if (timelineEntries.length) {
      await writeTimelineLogsExternal(timelineEntries, accountId, attributes);
    }

    transaction.commit();

    // start auto posting
    try {
      await autoPosting(attributes);
    } catch (error) {
      console.log(
        `Error occured while Auto Posting for invoice ID: ${invoiceId}, supplier: ${accountId}`,
        error
      );
    }

    return users[0];
  } catch (error) {
    console.log('Invoice assign has failed: ', error);
    transaction.rollback();

    throw new ApplicationError({
      message: `Invoice assign has failed - ${error}`,
      statusCode: 500,
    });
  }
};

const approveInvoice = async (attributes) => {
  const accountId = parseAccountId(attributes.accountId);
  const invoiceId = parseInt(attributes.invoiceId, 10);
  const { id: userId, workflowRole: userWorkflowRole } = attributes.user;
  const timelineEntries = [];

  // Fetch the invoice from invoice workflow table
  const invoiceWorkflow = await InvoiceWorkflow.getInvoiceWorkflow(
    accountId,
    invoiceId
  );

  if (!invoiceWorkflow) {
    throw new ApplicationError({
      message: 'No invoice found for this invoiceId',
      statusCode: 404,
    });
  }

  const currentStatus = invoiceWorkflow.status;

  // Invoice cannot be already cancelled or locked
  if (
    currentStatus === InvoiceWorkflow.STATUS.HOLD
    || currentStatus === InvoiceWorkflow.STATUS.CANCELLED
    || currentStatus === InvoiceWorkflow.STATUS.SIGNED_LOCKED
  ) {
    throw new ApplicationError({
      message: 'Hold or cancelled or locked invoices cannot be approved',
      statusCode: 403,
    });
  }

  // Check whether the invoice is assigned to the user to approve
  const assignedTo = invoiceWorkflow.assigned_to;

  if (assignedTo !== userId) {
    throw new ApplicationError({
      message: 'Invoice is not assigned to the user for approval',
      statusCode: 403,
    });
  }

  const { workflowId } = attributes.supplier;

  if (!workflowId) {
    throw new ApplicationError({
      message: 'An active workflow not found',
      statusCode: 403,
    });
  }

  const transaction = await knex.transaction();

  try {
    // Check if the workflow role has a parent role.
    // userWorkflowRole.parent === 0 is for top level role
    if (userWorkflowRole.parent >= 0) {
      if (userWorkflowRole.parent === 0) {
        // Top level role do the Approve and Sign at the same time. So, the invoice will change the status from 'ToApprove' to 'Signed'
        await InvoiceWorkflow.getQueryBuilder()
          .update({
            status: InvoiceWorkflow.STATUS.SIGNED,
            updatedAt: knex.fn.now(),
          })
          .where('invoice_workflow.invoice', invoiceId);

        // call QIP's relevant function to update status in `incominginvoice` table as well
        try {
          await callQIPForWFStatusChange(
            'sign',
            accountId,
            invoiceId,
            attributes
          );
        } catch (error) {
          console.log(
            'Calling QIP for workflow status change has failed: ',
            error
          );
        }

        // write to workflow history
        await InvoiceWorkflowHistory.create(
          workflowId,
          invoiceId,
          userId,
          currentStatus,
          InvoiceWorkflow.STATUS.SIGNED,
          assignedTo,
          assignedTo,
          InvoiceWorkflowHistory.TYPE.STATUS_CHANGED,
          transaction
        );

        // write to invoice timeline
        const timelineAttributes = {
          status: InvoiceWorkflow.STATUS.SIGNED,
          userId,
        };
        const timelineEntry = await getTimelineEntry(
          timelineAttributes,
          enums.TIMELINE_INCOMINGINVOICE_WF_STATUS_CHANGED,
          invoiceId
        );
        timelineEntries.push(timelineEntry);
      } else {
        // Normal roles which has a parent fetch the user for the parent role, which invoice going to be assigned next
        const nextRoleUser = await UserWorkflowRole.getQueryBuilder()
          .where('user_workflow_role.workflow_role', userWorkflowRole.parent)
          .where('user_workflow_role.active', true)
          .select(['user_workflow_role.user'])
          .first();

        await InvoiceWorkflow.getQueryBuilder()
          .update({
            workflow_role: userWorkflowRole.parent,
            assigned_to: nextRoleUser ? nextRoleUser.user : null,
            status: InvoiceWorkflow.STATUS.TO_SIGN,
          })
          .where('invoice_workflow.invoice', invoiceId);

        // call QIP's relevant function to update status in `incominginvoice` table as well
        try {
          await callQIPForWFStatusChange(
            'approve',
            accountId,
            invoiceId,
            attributes
          );
        } catch (error) {
          console.log(
            'Calling QIP for workflow status change has failed: ',
            error
          );
        }

        // write to workflow history
        await InvoiceWorkflowHistory.create(
          workflowId,
          invoiceId,
          userId,
          currentStatus,
          InvoiceWorkflow.STATUS.TO_SIGN,
          assignedTo,
          nextRoleUser ? nextRoleUser.user : null,
          InvoiceWorkflowHistory.TYPE.STATUS_CHANGED,
          transaction
        );

        // write to invoice timeline
        const timelineAttributes = {
          status: InvoiceWorkflow.STATUS.TO_SIGN,
          userId,
          toUser: nextRoleUser ? nextRoleUser.user : null,
        };
        const timelineEntry = await getTimelineEntry(
          timelineAttributes,
          enums.TIMELINE_INCOMINGINVOICE_WF_STATUS_CHANGED,
          invoiceId
        );
        timelineEntries.push(timelineEntry);
      }
    } else {
      throw new ApplicationError({
        message: 'No parent found for the current user role',
        statusCode: 500,
      });
    }

    if (timelineEntries.length) {
      await writeTimelineLogs(timelineEntries, accountId, attributes);
    }

    transaction.commit();

    return {
      message: 'Invoice approved successfully',
    };
  } catch (error) {
    console.log('Invoice approval has failed: ', error);
    transaction.rollback();

    throw new ApplicationError({
      message: 'Invoice approval has failed',
      statusCode: 500,
    });
  }
};

const getInvoicesAssignedToMe = async (attributes) => {
  const accountId = parseAccountId(attributes.accountId);
  const { id: userId } = attributes.user;

  const statuses = attributes.for
    ? [attributes.for]
    : [InvoiceWorkflow.STATUS.TO_APPROVE, InvoiceWorkflow.STATUS.TO_SIGN];

  // TODO: Improve 'InvoiceWorkflow.getInvoicesAssignedToUser' to fetch 'approved_at date' & 'approved_by user' from invoice timeline logs.
  // TODO: Need implement 'invoice timeline' to execute TODO comment above.
  // TODO: Need to solve the technical debt related to updating 'updated_at' fields in tables on create or update operations.
  // TODO: Calculating total_amount requirement needs to be re-clariefied. The incoming invoices are in differnt currencies.
  // So showing total of invoices in different currencies is not accurate.
  const assignedInvoices = await InvoiceWorkflow.getInvoicesAssignedToUser(
    accountId,
    userId,
    statuses
  );

  const resultsSchema = {
    invoice_lines: 0,
    invoices_count: 0,
  };

  const results = attributes.for
    ? { [attributes.for]: { ...resultsSchema, invoices: [] } }
    : {
      [InvoiceWorkflow.STATUS.TO_APPROVE]: { ...resultsSchema, invoices: [] },
      [InvoiceWorkflow.STATUS.TO_SIGN]: { ...resultsSchema, invoices: [] },
    };

  assignedInvoices.forEach((assignedInvoice) => {
    results[assignedInvoice.status].invoice_lines += parseInt(
      assignedInvoice.invoice_items,
      10
    );
    results[assignedInvoice.status].invoices_count += 1;

    results[assignedInvoice.status].invoices.push({
      id: assignedInvoice.invoice_id,
      invoice_num: assignedInvoice.invoice_num,
      amount: assignedInvoice.amount,
      received_at: assignedInvoice.sent_at,
      sender: assignedInvoice.sender,
      currency: assignedInvoice.currency,
      approved_user: assignedInvoice.approved_user_name,
      approved_date: assignedInvoice.approved_date,
      invoice_lines_count: parseInt(assignedInvoice.invoice_items, 10),
    });
  });

  return results;
};

const getInvoicePermissions = async (attributes) => {
  const accountId = parseAccountId(attributes.accountId);
  const invoiceId = parseInt(attributes.invoiceId, 10);
  const invoice = (
    await InvoiceWorkflow.getInvoiceById(accountId, invoiceId)
  )[0];
  let allowedActions = [];
  if (invoice) {
    if (invoice.status === InvoiceWorkflow.STATUS.TO_ASSIGN) {
      allowedActions = hasAssignPermission(
        invoice,
        attributes.user,
        allowedActions
      );
      allowedActions = await hasCancelPermission(
        invoice,
        attributes.user,
        allowedActions
      );
      allowedActions = hasHoldPermission(
        invoice,
        attributes.user,
        allowedActions
      );
    }
    if (invoice.status === InvoiceWorkflow.STATUS.TO_APPROVE) {
      allowedActions = await hasApprovePermission(
        invoice,
        attributes.user,
        allowedActions
      );
      allowedActions = await hasReassignPermission(
        invoice,
        attributes.user,
        allowedActions
      );
      allowedActions = await hasCancelPermission(
        invoice,
        attributes.user,
        allowedActions
      );
      allowedActions = hasHoldPermission(
        invoice,
        attributes.user,
        allowedActions
      );
    }
    if (invoice.status === InvoiceWorkflow.STATUS.TO_SIGN) {
      allowedActions = await hasSignPermission(
        invoice,
        attributes.user,
        allowedActions
      );
      allowedActions = await hasReassignPermission(
        invoice,
        attributes.user,
        allowedActions
      );
      allowedActions = await hasCancelPermission(
        invoice,
        attributes.user,
        allowedActions
      );
      allowedActions = hasHoldPermission(
        invoice,
        attributes.user,
        allowedActions
      );
    }
    if (invoice.status === InvoiceWorkflow.STATUS.SIGNED) {
      allowedActions = await hasCancelPermission(
        invoice,
        attributes.user,
        allowedActions
      );
    }
    if (invoice.status === InvoiceWorkflow.STATUS.HOLD) {
      allowedActions = await hasCancelPermission(
        invoice,
        attributes.user,
        allowedActions
      );
      allowedActions = await hasReleasePermission(
        invoice,
        attributes.user,
        allowedActions
      );
    }
  }
  return allowedActions;
};

const getInvoice = async (attributes) => {
  const accountId = parseAccountId(attributes.accountId);
  const invoiceId = parseInt(attributes.invoiceId, 10);

  // Check whether the invoice belongs to account
  const isValidInvoice = await InvoiceWorkflow.isInvoiceBelongsToAccount(
    accountId,
    invoiceId
  );

  // No such invoice for the supplier found
  if (!isValidInvoice) {
    throw new ApplicationError({
      message: 'Invoice not belongs to this account',
      statusCode: 403,
    });
  }

  const invoice = await InvoiceWorkflow.getInvoiceById(accountId, invoiceId);

  // Attach invoice item tags
  if (
    invoice.length > 0
    && invoice[0].items !== undefined
    && invoice[0].items.length > 0
  ) {
    await Promise.all(
      invoice[0].items.map(async (item) => {
        const itemData = item;
        itemData.invoiceItemTags = await tagHelper.getInvoiceItemDimensions(
          attributes,
          item.id
        );
      })
    );
  }
  // Get signed URLs for invoice attachments
  if (
    invoice.length > 0
    && invoice[0].attachments !== undefined
    && invoice[0].attachments.length > 0
  ) {
    // getting URL for each attachment
    invoice[0].attachments = invoice[0].attachments.map((attachment) => ({
      filename: attachment.filename,
      url: FileService.getSignedFileUrl(
        attachment.filename,
        process.env.AWS_INVOICE_ATTACHMENTS_BUCKET
      ),
    }));
  }

  if (invoice.length > 0) {
    invoice[0].permissionsList = await getInvoicePermissions(attributes);
    invoice[0].invoiceTags = await tagHelper.getInvoiceDimensions(attributes);
    invoice[0].invoiceTagsCount = tagHelper.getInvoiceDimensionsCount(
      invoice[0].invoiceTags
    );
    const activeWorkflowId = await Workflow.getSupplierActiveWorkflow(
      accountId
    );

    invoice[0].workflowHistory = await InvoiceWorkflowHistory.getInvoiceWorkflowHistory(
      activeWorkflowId,
      invoiceId
    );

    if (invoice[0].status === InvoiceWorkflow.STATUS.SIGNED) {
      const currentTime = new Date();

      // sign locked time = signed time + 24 hours, remaining time = time sign lock - current time
      const timeDifference = invoice[0].workflowHistory.updatedAt.getTime()
        + 24 * 3600 * 1000
        - currentTime.getTime();
      invoice[0].signLockDuration = timeDifference / 1000;
    }
  }

  if (
    invoice.length > 0
    && invoice[0].items !== undefined
    && invoice[0].items.length > 0
  ) {
    invoice[0].hasInvoiceItemDimensions = await tagHelper.isInvoiceItemHasDimensions(
      invoice[0].items
    );
  }
  return invoice;
};

const cancelInvoice = async (attributes) => {
  const accountId = parseAccountId(attributes.accountId);
  const invoiceId = parseInt(attributes.invoiceId, 10);
  const { id: userId } = attributes.user;

  // Fetch the invoice from invoice workflow table
  const invoiceWorkflow = await InvoiceWorkflow.getInvoiceWorkflow(
    accountId,
    invoiceId
  );

  if (!invoiceWorkflow) {
    throw new ApplicationError({
      message: 'No invoice found for this invoiceId',
      statusCode: 404,
    });
  }

  const currentStatus = invoiceWorkflow.status;

  // Invoice cannot be already cancelled or locked
  if (
    currentStatus === InvoiceWorkflow.STATUS.CANCELLED
    || currentStatus === InvoiceWorkflow.STATUS.SIGNED_LOCKED
  ) {
    throw new ApplicationError({
      message: 'Invoice is already cancelled or locked',
      statusCode: 403,
    });
  }

  const assignedTo = invoiceWorkflow.assigned_to;

  // if the user has only the 'workflow_cancel' permission, the invoice must be assigned to the user to cancel
  if (
    attributes.user.permissions.indexOf('workflow_cancel') !== -1
    && attributes.user.permissions.indexOf('general_cancel') === -1
  ) {
    if (assignedTo !== userId) {
      // if the invoice is assigned to a different user and this 'assigned_to' user is someone in a level below the user,
      // the user can still cancel the invoice
      const isAssignedUserBelowTheUser = await workflowService.checkUserIsBelowAnotherUser(
        {
          accountId,
          topUser: userId,
          belowUser: assignedTo,
        }
      );

      if (!isAssignedUserBelowTheUser) {
        throw new ApplicationError({
          message:
            'Invoice is not assigned to the user nor a user below to cancel',
          statusCode: 403,
        });
      }
    }
  }

  const transaction = await knex.transaction();

  try {
    const { workflowId } = attributes.supplier;

    // Updating the invoice' status as 'Cancelled'
    await InvoiceWorkflow.getQueryBuilder()
      .transacting(transaction)
      .update({
        status: InvoiceWorkflow.STATUS.CANCELLED,
      })
      .where('invoice_workflow.invoice', invoiceId);

    // call QIP's relevant function to update status in `incominginvoice` table as well
    try {
      await callQIPForWFStatusChange(
        'cancel',
        accountId,
        invoiceId,
        attributes
      );
    } catch (error) {
      console.log('Calling QIP for workflow status change has failed: ', error);
    }

    // write to workflow history
    await InvoiceWorkflowHistory.create(
      workflowId,
      invoiceId,
      userId,
      currentStatus,
      InvoiceWorkflow.STATUS.CANCELLED,
      assignedTo,
      assignedTo,
      InvoiceWorkflowHistory.TYPE.STATUS_CHANGED,
      transaction
    );

    // write to invoice timeline
    const timelineAttributes = {
      status: InvoiceWorkflow.STATUS.CANCELLED,
      userId: attributes.user.id,
    };
    const timelineEntry = await getTimelineEntry(
      timelineAttributes,
      enums.TIMELINE_INCOMINGINVOICE_WF_STATUS_CHANGED,
      invoiceId
    );

    await writeTimelineLogs([timelineEntry], accountId, attributes);

    transaction.commit();

    return {
      message: 'Invoice cancelled successfully',
    };
  } catch (error) {
    console.log('Invoice cancel has failed: ', error);
    transaction.rollback();

    throw new ApplicationError({
      message: 'Invoice cancel has failed',
      statusCode: 500,
    });
  }
};

const holdInvoice = async (attributes) => {
  const accountId = parseAccountId(attributes.accountId);
  const { invoiceId } = attributes;
  const { user } = attributes;
  const userId = attributes.user.id;

  // Fetch the invoice from invoice workflow table
  const invoiceWorkflow = await InvoiceWorkflow.getInvoiceWorkflow(
    accountId,
    invoiceId
  );

  // user must either own the invoices or they should be a general user
  const assignedTo = invoiceWorkflow.assigned_to;

  if (
    user.permissions.indexOf('general_hold') === -1
    && user.permissions.indexOf('workflow_hold') >= 0
    && assignedTo !== userId
  ) {
    return errorHelper({
      message: 'User does not have permission to perform this action',
      statusCode: 403,
    }).payload;
  }

  const currentStatus = invoiceWorkflow.status;

  // invoices should be in to sign, to approve, or to sign states
  if (
    currentStatus !== InvoiceWorkflow.STATUS.TO_ASSIGN
    && currentStatus !== InvoiceWorkflow.STATUS.TO_APPROVE
    && currentStatus !== InvoiceWorkflow.STATUS.TO_SIGN
  ) {
    return errorHelper({
      message: 'Invoice cannot be put on hold',
      statusCode: 403,
    }).payload;
  }

  const transaction = await knex.transaction();

  try {
    const workflowId = attributes.supplier
      ? attributes.supplier.workflowId
      : attributes.supplier;

    // must have a valid workflow for supplier
    if (workflowId) {
      // hold invoice
      await InvoiceWorkflow.getQueryBuilder()
        .transacting(transaction)
        .where('invoice', invoiceId)
        .update('status', InvoiceWorkflow.STATUS.HOLD);

      // call QIP's relevant function to update status in `incominginvoice` table as well
      try {
        await callQIPForWFStatusChange(
          'hold',
          accountId,
          invoiceId,
          attributes
        );
      } catch (error) {
        console.log(
          'Calling QIP for workflow status change has failed: ',
          error
        );
      }

      // write to workflow history
      await InvoiceWorkflowHistory.create(
        workflowId,
        invoiceId,
        userId,
        currentStatus,
        InvoiceWorkflow.STATUS.HOLD,
        assignedTo,
        assignedTo,
        InvoiceWorkflowHistory.TYPE.STATUS_CHANGED,
        transaction
      );

      // write to invoice timeline
      const timelineAttributes = {
        status: InvoiceWorkflow.STATUS.HOLD,
        userId,
      };
      const timelineEntry = await getTimelineEntry(
        timelineAttributes,
        enums.TIMELINE_INCOMINGINVOICE_WF_STATUS_CHANGED,
        invoiceId
      );

      await writeTimelineLogs([timelineEntry], accountId, attributes);

      transaction.commit();
      return {
        message: 'Invoice hold successfully',
      };
    }
    // workflow doesnt exist
    transaction.rollback();
    return errorHelper({
      message: 'Workflow not found',
      statusCode: 404,
    }).payload;
  } catch (e) {
    console.log('Invoice hold operation failed: ', e);
    transaction.rollback();
    return errorHelper({
      message: 'Invoice hold operation failed.',
      statusCode: 500,
    }).payload;
  }
};

const getUnassignedInvoices = async (attributes) => {
  const accountId = parseAccountId(attributes.accountId);

  const unassignedInvoices = await IncomingInvoice.getInvoicesByStatus(
    accountId,
    InvoiceWorkflow.STATUS.TO_ASSIGN
  );

  const results = unassignedInvoices.map((invoice) => {
    const {
      document_id: invoiceNumber,
      total,
      currency,
      createdAt,
      sender_data: { company_name: companyName },
    } = invoice;
    return {
      invoice_id: invoice.invoice,
      invoice_number: invoiceNumber,
      recieved_date: createdAt,
      sender: companyName,
      amount: total,
      currency,
    };
  });
  return results;
};

const reassignInvoice = async (attributes) => {
  const accountId = parseAccountId(attributes.accountId);
  const invoiceId = parseInt(attributes.invoiceId, 10);
  const { id: userId } = attributes.user;

  // Fetch the invoice from invoice workflow table
  const invoiceWorkflow = await InvoiceWorkflow.getInvoiceWorkflow(
    accountId,
    invoiceId
  );

  if (!invoiceWorkflow) {
    throw new ApplicationError({
      message: 'No invoice found for this invoiceId',
      statusCode: 404,
    });
  }

  const currentStatus = invoiceWorkflow.status;

  // Invoice cannot be already cancelled or signed or locked
  if (
    currentStatus === InvoiceWorkflow.STATUS.CANCELLED
    || currentStatus === InvoiceWorkflow.STATUS.SIGNED
    || currentStatus === InvoiceWorkflow.STATUS.SIGNED_LOCKED
  ) {
    throw new ApplicationError({
      message: 'Cancelled or signed or locked invoices cannot be reassigned',
      statusCode: 403,
    });
  }

  const assignedTo = invoiceWorkflow.assigned_to;

  // if the user has only the 'workflow_reassign' permission, the invoice must be either:
  // assigned to the user
  // or assigned to a user below
  if (
    attributes.user.permissions.indexOf('workflow_reassign') !== -1
    && attributes.user.permissions.indexOf('general_reassign') === -1
  ) {
    if (assignedTo !== userId) {
      // if the invoice is assigned to a different user and this 'assigned_to' user is someone in a level below the user,
      // the user can still reassign the invoice
      const isAssignedUserBelowTheUser = await workflowService.checkUserIsBelowAnotherUser(
        {
          accountId,
          topUser: userId,
          belowUser: assignedTo,
        }
      );

      if (!isAssignedUserBelowTheUser) {
        throw new ApplicationError({
          message: 'Invoice is not assigned to the user for reassign',
          statusCode: 403,
        });
      }
    }
  }

  const targetUserId = parseInt(attributes.userId, 10);

  // Check target user is a workflow-role user
  const targetUserWorkflowRole = await UserWorkflowRole.fetchUserWorkflowRole(
    accountId,
    targetUserId
  );

  if (targetUserWorkflowRole.length === 0) {
    throw new ApplicationError({
      message: 'Target user is not a workflow user',
      statusCode: 403,
    });
  }

  const transaction = await knex.transaction();

  try {
    const { workflowId } = attributes.supplier;

    // if the currentStatus is 'ToSign', it stays in 'ToSign'. If not, it becomes 'ToApprove'
    const toStatus = currentStatus === InvoiceWorkflow.STATUS.TO_SIGN
      ? InvoiceWorkflow.STATUS.TO_SIGN
      : InvoiceWorkflow.STATUS.TO_APPROVE;

    await InvoiceWorkflow.getQueryBuilder()
      .update({
        assigned_to: targetUserId,
        workflow_role: targetUserWorkflowRole[0].workflow_role,
        status: toStatus,
      })
      .where('invoice_workflow.invoice', invoiceId);

    if (toStatus === InvoiceWorkflow.STATUS.TO_APPROVE) {
      // call QIP's relevant function to update status in `incominginvoice` table as well
      try {
        await callQIPForWFStatusChange(
          'unapprove',
          accountId,
          invoiceId,
          attributes
        );
      } catch (error) {
        console.log(
          'Calling QIP for workflow status change has failed: ',
          error
        );
      }
    }

    // write to workflow history
    await InvoiceWorkflowHistory.create(
      workflowId,
      invoiceId,
      userId,
      currentStatus,
      toStatus,
      assignedTo,
      targetUserId,
      InvoiceWorkflowHistory.TYPE.INVOICE_REASSIGNED,
      transaction
    );

    // write to invoice timeline
    const timelineAttributes = {
      status: toStatus,
      userId: attributes.user.id,
      toUser: targetUserId,
    };
    const timelineEntry = await getTimelineEntry(
      timelineAttributes,
      enums.TIMELINE_INCOMINGINVOICE_RE_ASSIGNED,
      invoiceId
    );

    await writeTimelineLogs([timelineEntry], accountId, attributes);

    transaction.commit();

    return {
      message: 'Invoice reassigned successfully',
    };
  } catch (error) {
    console.log('Invoice reassign has failed: ', error);
    transaction.rollback();

    throw new ApplicationError({
      message: 'Invoice reassign has failed',
      statusCode: 500,
    });
  }
};

const releaseInvoice = async (attributes) => {
  const accountId = parseAccountId(attributes.accountId);
  const { invoiceId } = attributes;
  const { user } = attributes;
  const userId = attributes.user.id;

  // Fetch the invoice from invoice workflow table
  const invoiceWorkflow = await InvoiceWorkflow.getInvoiceWorkflow(
    accountId,
    invoiceId
  );

  if (!invoiceWorkflow) {
    throw new ApplicationError({
      message: 'No invoice found for this invoiceId',
      statusCode: 404,
    });
  }

  // user must either own the invoices or they should be a general user
  const assignedTo = invoiceWorkflow.assigned_to;

  if (
    user.permissions.indexOf('general_hold') === -1
    && user.permissions.indexOf('workflow_hold') >= 0
    && assignedTo !== userId
  ) {
    // if the user has the workflow permission only and the invoice is not assigned to the user, user can still release the invoice
    // if the invoice assigned_to user is someone in a level below the user
    const isAssignedUserBelowTheUser = await workflowService.checkUserIsBelowAnotherUser(
      {
        accountId,
        topUser: userId,
        belowUser: assignedTo,
      }
    );

    if (!isAssignedUserBelowTheUser) {
      return errorHelper({
        message: 'User does not have permission to perform this action',
        statusCode: 403,
      }).payload;
    }
  }

  const currentStatus = invoiceWorkflow.status;

  // only hold invoices can be released
  if (currentStatus !== InvoiceWorkflow.STATUS.HOLD) {
    return errorHelper({
      message: 'Invoice cannot be released',
      statusCode: 403,
    }).payload;
  }

  const transaction = await knex.transaction();

  try {
    const { workflowId } = attributes.supplier;

    // must have a valid workflow for supplier
    if (workflowId) {
      // when releasing an invoice, should change the invoice's status back to the status it had before holding
      // invoice's pre-hold status can be retrieved by getting its last history record
      // the invoice's last history record's from_status is the invoice's pre-hold status and also the post-hold status (toStatus)
      const {
        from_status: toStatus,
      } = await InvoiceWorkflowHistory.getInvoiceWorkflowHistory(
        workflowId,
        invoiceId
      );

      // release invoice
      await InvoiceWorkflow.getQueryBuilder()
        .transacting(transaction)
        .where('invoice', invoiceId)
        .update('status', toStatus);

      // call QIP's relevant function to update status in `incominginvoice` table as well
      try {
        await callQIPForWFStatusChange(
          'unonhold',
          accountId,
          invoiceId,
          attributes
        );
      } catch (error) {
        console.log(
          'Calling QIP for workflow status change has failed: ',
          error
        );
      }

      // write to workflow history
      await InvoiceWorkflowHistory.create(
        workflowId,
        invoiceId,
        userId,
        currentStatus,
        toStatus,
        assignedTo,
        assignedTo,
        InvoiceWorkflowHistory.TYPE.STATUS_CHANGED,
        transaction
      );

      const timelineAttributes = {
        fromStatus: invoiceWorkflow.status,
        status: toStatus,
        userId,
        assignedToUser: assignedTo,
      };
      const timelineEntry = await getTimelineEntry(
        timelineAttributes,
        enums.TIMELINE_INCOMINGINVOICE_WF_STATUS_CHANGED,
        invoiceId
      );

      await writeTimelineLogs([timelineEntry], accountId, attributes);

      transaction.commit();
      return {
        message: 'Invoice released successfully',
      };
    }
    // workflow doesnt exist
    return errorHelper({
      message: 'Workflow not found',
      statusCode: 404,
    }).payload;
  } catch (e) {
    console.log('Invoice release operation failed: ', e);
    transaction.rollback();
    return errorHelper({
      message: 'Invoice release operation failed.',
      statusCode: 500,
    }).payload;
  }
};

const signInvoice = async (attributes) => {
  const accountId = parseAccountId(attributes.accountId);
  const invoiceId = parseInt(attributes.invoiceId, 10);

  const {
    id: userId,
    workflowRole: { id: userWorkflowRoleId, parent: userWorkflowRoleParent },
  } = attributes.user;
  const { workflowId } = attributes.supplier;
  const timelineEntries = [];

  // Fetch the invoice from invoice workflow table
  const invoiceWorkflow = await InvoiceWorkflow.getInvoiceWorkflow(
    accountId,
    invoiceId
  );

  if (!invoiceWorkflow) {
    throw new ApplicationError({
      message: 'No invoice found for this invoiceId',
      statusCode: 404,
    });
  }

  if (!userWorkflowRoleId) {
    throw new ApplicationError({
      message: 'User is not a workflow user',
      statusCode: 403,
    });
  }

  const currentStatus = invoiceWorkflow.status;

  if (
    currentStatus === InvoiceWorkflow.STATUS.CANCELLED
    || currentStatus === InvoiceWorkflow.STATUS.SIGNED
    || currentStatus === InvoiceWorkflow.STATUS.SIGNED_LOCKED
  ) {
    throw new ApplicationError({
      message: 'Invoice is already cancelled or signed or locked',
      statusCode: 403,
    });
  }

  const assignedTo = invoiceWorkflow.assigned_to;

  if (assignedTo !== userId) {
    throw new ApplicationError({
      message: 'Invoice is not assigned to the user to sign',
      statusCode: 403,
    });
  }

  // get the invoice total amount
  const {
    total,
    currency: invoiceCurrency,
    createdAt: invoiceDate,
  } = await InvoiceWorkflow.getQueryBuilder()
    .select([
      'incominginvoice.total',
      'incominginvoice.currency',
      'incominginvoice.createdAt',
    ])
    .where('invoice_workflow.invoice', invoiceId)
    .where('invoice_workflow.supplier', accountId)
    .innerJoin(
      'incominginvoice',
      'invoice_workflow.invoice',
      '=',
      'incominginvoice.id'
    )
    .first();

  const {
    currency: supplierCurrency,
  } = await Supplier.getSupplierById(accountId, ['currency']);

  let invoiceTotal = total;
  if (invoiceCurrency !== supplierCurrency) {
    const convertedAmounts = await currencyConversionHelper.convertCurrency(
      total,
      invoiceCurrency,
      supplierCurrency,
      invoiceDate
    );
    invoiceTotal = convertedAmounts.local;
  }

  // get user spending limit
  const spendingLimit = await WorkflowRuleCondition.getCondition(
    userWorkflowRoleId,
    'spending_limit'
  );

  if (!spendingLimit) {
    throw new ApplicationError({
      message: 'User does not have a spending limit',
      statusCode: 403,
    });
  }

  const transaction = await knex.transaction();

  try {
    // if the user has enough spending limit:
    // - invoice gets 'Signed'
    // - a history record gets written for invoice signing
    // if the user doesn't have enough spending limit:
    // - invoice reassigns to the next user in hierarchy and invoice status is 'ToSign'
    // - two history records gets written, 1) invoice signing, 2) invoice reassigning to next user in hierarchy while invoice status change back to 'ToSign'

    // write to workflow history
    await InvoiceWorkflowHistory.create(
      workflowId,
      invoiceId,
      userId,
      currentStatus,
      InvoiceWorkflow.STATUS.SIGNED,
      assignedTo,
      assignedTo,
      InvoiceWorkflowHistory.TYPE.STATUS_CHANGED,
      transaction
    );

    if (
      spendingLimit.value === 'Infinity'
      || parseFloat(spendingLimit.value) >= invoiceTotal
    ) {
      await InvoiceWorkflow.getQueryBuilder()
        .transacting(transaction)
        .update({
          status: InvoiceWorkflow.STATUS.SIGNED,
          updatedAt: knex.fn.now(),
        })
        .where('invoice_workflow.invoice', invoiceId);

      // call QIP's relevant function to update status in `incominginvoice` table as well
      try {
        await callQIPForWFStatusChange(
          'sign',
          accountId,
          invoiceId,
          attributes
        );
      } catch (error) {
        console.log(
          'Calling QIP for workflow status change has failed: ',
          error
        );
      }

      // write to invoice timeline
      const timelineAttributes = {
        status: InvoiceWorkflow.STATUS.SIGNED,
        userId,
      };
      const timelineEntry = await getTimelineEntry(
        timelineAttributes,
        enums.TIMELINE_INCOMINGINVOICE_WF_STATUS_CHANGED,
        invoiceId
      );
      timelineEntries.push(timelineEntry);
    } else {
      const nextRoleUser = await UserWorkflowRole.getQueryBuilder()
        .where('user_workflow_role.workflow_role', userWorkflowRoleParent)
        .where('user_workflow_role.active', true)
        .select(['user_workflow_role.user'])
        .first();

      await InvoiceWorkflow.getQueryBuilder()
        .transacting(transaction)
        .update({
          workflow_role: userWorkflowRoleParent,
          assigned_to: nextRoleUser ? nextRoleUser.user : null,
          status: InvoiceWorkflow.STATUS.TO_SIGN,
        })
        .where('invoice_workflow.invoice', invoiceId);

      // write to workflow history
      await InvoiceWorkflowHistory.create(
        workflowId,
        invoiceId,
        userId,
        InvoiceWorkflow.STATUS.SIGNED,
        InvoiceWorkflow.STATUS.TO_SIGN,
        assignedTo,
        nextRoleUser ? nextRoleUser.user : null,
        InvoiceWorkflowHistory.TYPE.INVOICE_REASSIGNED,
        transaction
      );

      // write to invoice timeline
      const timelineAttributes = {
        status: InvoiceWorkflow.STATUS.TO_SIGN,
        userId,
        toUser: nextRoleUser ? nextRoleUser.user : null,
      };
      const timelineEntry = await getTimelineEntry(
        timelineAttributes,
        nextRoleUser
          ? enums.TIMELINE_INCOMINGINVOICE_RE_ASSIGNED_ON_SIGN
          : enums.TIMELINE_INCOMINGINVOICE_UNASSIGNED,
        invoiceId
      );
      timelineEntries.push(timelineEntry);
    }

    if (timelineEntries.length) {
      await writeTimelineLogs(timelineEntries, accountId, attributes);
    }

    transaction.commit();

    if (
      spendingLimit.value === 'Infinity'
      || parseFloat(spendingLimit.value) >= invoiceTotal
    ) {
      return {
        message: 'Invoice signed successfully',
      };
    }
    return {
      message:
        'Invoice exceeds the spending limit. Assigned to the parent user for signing.',
    };
  } catch (error) {
    console.log(
      `Invoice sign has failed for userWorkflowRoleId ${userWorkflowRoleId} and userWorkflowRoleParent ${userWorkflowRoleParent}: `,
      error
    );
    transaction.rollback();

    throw new ApplicationError({
      message: 'Invoice sign has failed',
      statusCode: 500,
    });
  }
};

const getAssignableUsers = async (attributes) => {
  const accountId = parseAccountId(attributes.accountId);
  const invoiceId = parseInt(attributes.invoiceId, 10);
  const workflowRoleType = await WorkflowRoleType.getRoleType(
    WorkflowRoleType.ROLE_TYPES.workflow
  );
  const invoiceWorkflow = await InvoiceWorkflow.getQueryBuilder()
    .where('invoice', invoiceId)
    .first();

  let usersListQuery = User.getQueryBuilder()
    .innerJoin('user_workflow_role', 'user.id', 'user_workflow_role.user')
    .innerJoin(
      'workflow_role',
      'user_workflow_role.workflow_role',
      'workflow_role.id'
    )
    .where('workflow_role.supplier', accountId)
    .where('workflow_role.active', true)
    .where('user_workflow_role.active', true)
    .where('workflow_role.role_type', workflowRoleType.id)
    .where('user.deleted', false);

  if (invoiceWorkflow && invoiceWorkflow.assigned_to) {
    usersListQuery = usersListQuery.whereNotIn('user.id', [
      invoiceWorkflow.assigned_to,
    ]);
  }
  const usersList = await usersListQuery.select(
    'user.id',
    'user.email',
    'user.phone',
    'user.name',
    'user.image_url',
    'user.title',
    'user.countrycode'
  );
  return {
    usersList,
  };
};

const assignUnassignedInvoice = async (attributes) => {
  const accountId = parseAccountId(attributes.accountId);
  const invoiceId = parseInt(attributes.invoiceId, 10);
  const { id: userId } = attributes.user;

  // Fetch the invoice from invoice workflow table
  const invoiceWorkflow = await InvoiceWorkflow.getInvoiceWorkflow(
    accountId,
    invoiceId
  );

  if (!invoiceWorkflow) {
    throw new ApplicationError({
      message: 'No invoice found for this invoiceId',
      statusCode: 404,
    });
  }

  if (invoiceWorkflow.status !== InvoiceWorkflow.STATUS.TO_ASSIGN) {
    throw new ApplicationError({
      message: 'Invoice not in To Assign state to assign a user',
      statusCode: 403,
    });
  }

  const targetUserId = parseInt(attributes.userId, 10);

  // Check target user is a workflow-role user
  const targetUserWorkflowRole = await UserWorkflowRole.fetchUserWorkflowRole(
    accountId,
    targetUserId
  );

  if (targetUserWorkflowRole.length === 0) {
    throw new ApplicationError({
      message: 'Target user is not a workflow user',
      statusCode: 403,
    });
  }

  const transaction = await knex.transaction();

  try {
    const { workflowId } = attributes.supplier;

    const toStatus = InvoiceWorkflow.STATUS.TO_APPROVE;

    await InvoiceWorkflow.getQueryBuilder()
      .update({
        assigned_to: targetUserId,
        workflow_role: targetUserWorkflowRole[0].workflow_role,
        status: toStatus,
      })
      .where('invoice_workflow.invoice', invoiceId);

    // call QIP's relevant function to update status in `incominginvoice` table as well
    try {
      await callQIPForWFStatusChange(
        'unapprove',
        accountId,
        invoiceId,
        attributes
      );
    } catch (error) {
      console.log('Calling QIP for workflow status change has failed: ', error);
    }

    // write to workflow history
    await InvoiceWorkflowHistory.create(
      workflowId,
      invoiceId,
      userId,
      InvoiceWorkflow.STATUS.TO_ASSIGN,
      toStatus,
      null,
      targetUserId,
      InvoiceWorkflowHistory.TYPE.STATUS_CHANGED,
      transaction
    );

    // write to invoice timeline
    const timelineAttributes = {
      status: toStatus,
      userId: attributes.user.id,
      toUser: targetUserId,
    };
    const timelineEntry = await getTimelineEntry(
      timelineAttributes,
      enums.TIMELINE_INCOMINGINVOICE_ASSIGNED,
      invoiceId
    );

    await writeTimelineLogs([timelineEntry], accountId, attributes);

    transaction.commit();

    return {
      message: 'Invoice assigned successfully',
    };
  } catch (error) {
    transaction.rollback();
    throw new ApplicationError({
      message: 'Invoice assign has failed',
      statusCode: 500,
    });
  }
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
