const Model = require('../model');

const PostingVatRateModel = new Model('posting_vat_rate');

PostingVatRateModel.findVatPercentageByCountry = (country, select = '*') => PostingVatRateModel.getQueryBuilder()
  .where('country', '=', country)
  .select([select]);

module.exports = PostingVatRateModel;
