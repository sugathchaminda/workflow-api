/**
 * @description A class for Generic Application Error
 * @param {{message?: string, statusCode?: number}} param
 */
function ApplicationError({
  message = 'Un known error',
  statusCode = 500,
} = {}) {
  Error.captureStackTrace(this, this.constructor);
  this.code = statusCode;
  this.message = message;
}

ApplicationError.prototype = Object.create(Error.prototype);
ApplicationError.prototype.constructor = ApplicationError;

module.exports = ApplicationError;
