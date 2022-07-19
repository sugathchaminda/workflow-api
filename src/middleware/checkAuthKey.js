/* eslint-disable no-console */
const _ = require('lodash');
const rangeCheck = require('range_check');
const errorHelper = require('../utils/errorHelper');

const validateKey = (authHeader) => authHeader === process.env.AUTH_KEY;

const hasAccess = (ip, authHeader) => {
  const ipWhitelist = process.env.IP_WHITELIST;
  const subnetWhitelist = process.env.SUBNET_WHITELIST;

  if (_.includes(ipWhitelist, ip)) {
    return true;
  }
  if (rangeCheck.inRange(ip, subnetWhitelist)) {
    return validateKey(authHeader);
  }

  return false;
};

module.exports = (req, res, next) => {
  try {
    let incomingIp = '';

    if (req.headers['x-forwarded-for']) {
      incomingIp = req.headers['x-forwarded-for'];
    } else if (req.connection && req.connection.remoteAddress) {
      incomingIp = req.connection.remoteAddress;
    } else if (req.socket && req.socket.remoteAddress) {
      incomingIp = req.socket.remoteAddress;
    } else if (
      req.connection
      && req.connection.socket
      && req.connection.socket.remoteAddress
    ) {
      incomingIp = req.connection.socket.remoteAddress;
    }

    // if behind a proxy the ip looks like: "client, proxy1, proxy2, proxy3"
    const [ip] = incomingIp.split(',');

    if (hasAccess(ip, req.headers.authorization)) {
      return next();
    }
  } catch (e) {
    console.log('Key validation error', e);
    return res.status(403).json(
      errorHelper({
        message: `Authentication failed: ${e.message}`,
        statusCode: 403,
      }).payload
    );
  }

  return res.status(403).json(
    errorHelper({
      message: 'Authentication failed.',
      statusCode: 403,
    }).payload
  );
};
