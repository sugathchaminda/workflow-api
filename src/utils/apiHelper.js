/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
const got = require('got');
const { isObject } = require('lodash');
const ApplicationError = require('./ApplicationError');

/**
 * @description Creates a http object with request parameters
 * @param {{method: string, uri: string, body?: object, headers?: object}} options http request object
 * @returns {void} returns an instance of API object with methods like send and addCookie
 */
function API(options = {}) {
  const defaultOptions = {
    https: {
      rejectUnauthorized: false,
    },
  };

  this.options = options;
  this.request = got.extend({
    ...defaultOptions,
    prefixUrl: this.options.uri,
    headers: options.headers || {},
  });
}

/**
 * @description will make the request with created API object
 * @param {object} [body] - stringified json object
 * @returns {Response} returns API response
 */
API.prototype.send = async function send(body = null) {
  if (isObject(body)) {
    this.options.body = body;
  }

  const data = {
    json: this.options.body || {},
    responseType: 'json',
  };

  try {
    switch (this.options.method.toUpperCase()) {
      case 'GET':
        return this.request.get('');
      case 'POST':
        return this.request.post('', data);
      case 'PUT':
        return this.request.put('', data);
      case 'PATCH':
        return this.request.patch('', data);
      case 'DELETE':
        return this.request.delete('', data);
      default:
        throw new ApplicationError({
          message: 'Requested http method not allowed',
          statusCode: 405,
        });
    }
  } catch (error) {
    console.log('apiHelper exception: ', error);
    if (error.code < 500) {
      throw error;
    } else {
      throw new ApplicationError({ message: error.message });
    }
  }
};

API.prototype.addCookie = function addCookie(cookie) {
  this.request = this.request.extend({
    headers: {
      cookie,
    },
  });

  return this;
};

const HOST = process.env.QVALIA_QIP_HOST.slice(0, 4) === 'http'
  ? process.env.QVALIA_QIP_HOST
  : `https://${process.env.QVALIA_QIP_HOST}`;
const QIP_API_VERSION = 'v1';

module.exports = {
  INTERNAL_BASE_API: `${HOST}/internal/${QIP_API_VERSION}`,
  EXTERNAL_BASE_API: `${HOST}/external/${QIP_API_VERSION}`,
  API,
};
