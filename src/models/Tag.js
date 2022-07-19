/* eslint-disable func-names */
const Model = require('../model');

const TagModel = new Model('tag');

TagModel.getByIds = async (accountId, tagIds) => {
  const result = await TagModel.getQueryBuilder()
    .where('tag.account', accountId)
    .whereIn('tag.id', tagIds);

  return result;
};

module.exports = TagModel;
