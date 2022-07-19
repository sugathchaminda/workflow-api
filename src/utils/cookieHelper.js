// const _ = require('lodash');

const getSetCookie = (attributes) => {
  let strCookie = '';
  if (attributes.cookies) {
    Object.keys(attributes.cookies).forEach((key) => {
      const val = attributes.cookies[key];
      if (val) strCookie += `${key}=${val}; `;
    });
    strCookie = strCookie.slice(0, -2);
  }
  return strCookie;
};

const extractSailsSid = (cookie) => {
  const filterPrefix = cookie.split('s:')[1];

  if (!filterPrefix) {
    return false;
  }

  const filterSecret = filterPrefix.split('.')[0];

  return filterSecret;
};

module.exports = {
  getSetCookie,
  extractSailsSid,
};
