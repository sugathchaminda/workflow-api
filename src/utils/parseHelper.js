const ApplicationError = require('./ApplicationError');

const parseAccountId = (num) => {
  // eslint-disable-next-line no-restricted-globals
  if (isNaN(num)) {
    throw new ApplicationError({
      message: 'Parse error: Invalid accountId',
      statusCode: 422,
    });
  }

  return parseInt(num, 10);
};

module.exports = {
  parseAccountId,
};
