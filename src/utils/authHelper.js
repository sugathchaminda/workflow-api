const COOKIELESS_ENDPOINT_PATTERNS = [
  '/workflow/.+/invoice/.+/assign$',
  '/workflow/.+/invite/accept$',
];

const isCookieLessPath = (path) => COOKIELESS_ENDPOINT_PATTERNS.some((pattern) => !!path.match(pattern));

module.exports = {
  isCookieLessPath,
};
