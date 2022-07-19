const { defaultReject, defaultResolve } = require('./utils/responseHelper');

const controller = async (req, res, params) => {
  const resolve = params.resolve ? params.resolve : defaultResolve;
  const reject = params.reject ? params.reject : defaultReject;

  try {
    const attributes = await params.validator(req);
    if (req.cookies) {
      attributes.cookies = req.cookies;
    }

    const data = await params.service(attributes, {});

    return resolve(res, data);
  } catch (err) {
    return reject(err, res, req);
  }
};

module.exports = controller;
