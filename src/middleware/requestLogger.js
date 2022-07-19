const Logger = require('../utils/loggingHelper');

async function asyncLog(req) {
  const logger = new Logger(process.env.LAMBDA_STAGE);
  await logger.log('info', {
    url: req.path,
    method: req.method,
    origin: req.headers.origin || '',
    env: process.env.LAMBDA_STAGE,
  });
}

module.exports = async (req, res, next) => {
  await asyncLog(req);
  next();
};
