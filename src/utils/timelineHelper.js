const _ = require('lodash');
const { source } = require('../enums/timelineEnums');
const { API, EXTERNAL_BASE_API, INTERNAL_BASE_API } = require('./apiHelper');
const { getSetCookie } = require('./cookieHelper');
const { User: UserModel } = require('../models');

const getUserNameById = async (id) => {
  const user = await UserModel.fetchUserById(id);
  return user.name;
};

const getTranslationData = async (attributes) => {
  let username = '';
  let toUserName = '';
  let assignedToUserName = '';

  if (attributes.userId) {
    username = await getUserNameById(attributes.userId);
  }
  if (attributes.toUser) {
    toUserName = await getUserNameById(attributes.toUser);
  }
  if (attributes.assignedToUser) {
    assignedToUserName = await getUserNameById(attributes.assignedToUser);
  }

  const translationData = {
    user_id: attributes.userId,
    user_name: username !== '' ? username : undefined,
    from_status: attributes.fromStatus,
    to_status: attributes.status,
    to_user: attributes.toUser,
    to_user_name: toUserName !== '' ? toUserName : undefined,
    comment: attributes.comment,
    assigned_to: assignedToUserName !== '' ? assignedToUserName : undefined,
  };
  return _.pickBy(translationData, (x) => x !== undefined);
};

const getTimelineEntry = async (
  translationData,
  translationKey,
  invoiceId,
  sourceSystem
) => ({
  invoice_id: invoiceId,
  source: sourceSystem || source.system,
  translation_data: await getTranslationData(translationData),
  translation_key: translationKey,
});

const writeTimelineLogs = async (timelineData, accountId, cookieAttributes) => {
  const api = new API({
    method: 'POST',
    uri: `${INTERNAL_BASE_API}/suppliers/${accountId}/incominginvoices/timeline`,
  });

  const body = {
    entries: timelineData,
  };

  const result = await api.addCookie(getSetCookie(cookieAttributes)).send(body);
  return result;
};

const writeTimelineLogsExternal = async (
  timelineData,
  accountId,
  attributes
) => {
  const api = new API({
    method: 'POST',
    uri: `${EXTERNAL_BASE_API}/suppliers/${accountId}/incominginvoices/timeline`,
    headers: {
      authorization: attributes.authKey,
    },
  });

  const body = {
    entries: timelineData,
  };

  const result = await api.send(body);

  return result;
};

module.exports = {
  getTimelineEntry,
  getTranslationData,
  writeTimelineLogs,
  writeTimelineLogsExternal,
};
