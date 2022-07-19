const Model = require('../model');
const knex = require('../db');

const ExchangeRateModel = new Model('exchangerate');

ExchangeRateModel.getRatesByDate = async (date) => {
  const result = await knex.raw(
    'select rates from exchangerate where Date(date) = ?',
    date
  );

  return result.rows;
};

module.exports = ExchangeRateModel;
