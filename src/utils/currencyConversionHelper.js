const { ExchangeRate } = require('../models');
const ApplicationError = require('./ApplicationError');

const convertCurrency = async (
  amount,
  documentCurrency,
  localCurrency,
  date
) => {
  const document = amount;
  let local = 0;
  let system = 0;

  const dateInUtc = new Date(date.toUTCString());

  const [exchangeRates] = await ExchangeRate.getRatesByDate(dateInUtc);

  if (exchangeRates) {
    const { rates } = exchangeRates;

    // convert document currency to Euro
    const documentRate = rates[documentCurrency];
    const localRate = rates[localCurrency];

    system = +(amount / documentRate).toFixed(2);

    local = localCurrency === documentCurrency
      ? amount
      : +((localRate / documentRate) * amount).toFixed(2);
  } else {
    throw new ApplicationError({
      message: 'Exchange rates for the given date does not exist.',
      statusCode: 422,
    });
  }

  return {
    local,
    document,
    system,
  };
};

module.exports = {
  convertCurrency,
};
