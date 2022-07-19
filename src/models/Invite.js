/* eslint-disable func-names */
const Model = require('../model');

const InviteModel = new Model('invite as invite');

// InviteModel Specific Functions (write the functions as member functions)
// ex: InviteModel.create = function () {} -> use normal function instead of arrow function

/**
 * @description Check whether the invite is a valid one
 * @param {Number} inviteId
 * @param {Number} accountId
 * @returns {Boolean} isValid whether the invite is valid or not
 */
InviteModel.isValidInviteForSupplier = async function (inviteId, accountId) {
  // valid until is a postgres timestamptz column, so the date should be converted to UTC string
  const now = new Date().toUTCString();

  const response = await this.getQueryBuilder()
    .where('invite.id', inviteId)
    .where('invite.supplier', accountId)
    .where('invite.valid_until', '>=', now);

  return response.length > 0;
};

module.exports = InviteModel;
