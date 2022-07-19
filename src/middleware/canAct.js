const errorHelper = require('../utils/errorHelper');

module.exports = async (req, res, next) => {
  let hasPermission = false;
  if (
    Array.isArray(req.action)
    && req.user.permissions.some(
      (permission) => req.action.indexOf(permission) >= 0
    )
  ) {
    hasPermission = true;
  } else if (
    !Array.isArray(req.action)
    && req.user.permissions.indexOf(req.action) >= 0
  ) {
    hasPermission = true;
  }
  if (!hasPermission) {
    return res.status(403).json(
      errorHelper({
        message: 'Forbidden.',
        statusCode: 403,
      }).payload
    );
  }

  return next();
};
