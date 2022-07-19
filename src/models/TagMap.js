/* eslint-disable func-names */
const Model = require('../model');

const TagMapModel = new Model('tagmap');

TagMapModel.create = async (tagMapRecords, transaction = null) => {
  const query = TagMapModel.getQueryBuilder();

  if (transaction) {
    query.transacting(transaction);
  }

  const id = await query.insert(tagMapRecords).returning(['id']);
  return id;
};

TagMapModel.findTagMapForUserByObjectTypeObjectId = async (
  account,
  objectType,
  objectId
) => {
  const result = await TagMapModel.getQueryBuilder()
    .where('tagmap.account', account)
    .where('tagmap.object_type', objectType)
    .where('tagmap.object_id', objectId);
  return result;
};

TagMapModel.deleteTagMapByUUIDs = async (accountId, uuids) => {
  // delete tagmaps according to uuids
  const response = await TagMapModel.getQueryBuilder()
    .where('tagmap.account', accountId)
    .whereIn('tagmap.uuid', uuids)
    .del();

  return response;
};

TagMapModel.getByTagObjectTypeObjectID = async (tag, objectType, objectID) => {
  const result = await TagMapModel.getQueryBuilder()
    .where('tagmap.tag', tag)
    .where('tagmap.object_type', objectType)
    .where('tagmap.object_id', objectID)
    .first();

  return result;
};

TagMapModel.findExistingDimension = async (tag, objectType, objectId) => {
  const result = await TagMapModel.getQueryBuilder()
    .where('tagmap.tag', tag)
    .where('tagmap.object_type', objectType)
    .where('tagmap.object_id', objectId)
    .first();

  return result;
};

TagMapModel.deleteTagMaps = async (tagMapIds) => {
  const response = await TagMapModel.getQueryBuilder()
    .whereIn('id', tagMapIds)
    .del();

  return response;
};

TagMapModel.checkTagMapsBelongsToSupplier = async (tagMapIds, account) => {
  const response = await TagMapModel.getQueryBuilder()
    .whereIn('tagmap.id', tagMapIds)
    .where('tagmap.account', account);

  if (tagMapIds.length !== response.length) {
    return false;
  }

  return true;
};

module.exports = TagMapModel;
