const Model = require('../model');

const UserSupplierRoleModel = new Model('usersupplierrole as usersupplierrole');

UserSupplierRoleModel.isUserExistForSupplier = async function (
  accountId,
  userId,
  transaction = null
) {
  const query = this.getQueryBuilder();

  if (transaction) {
    query.transacting(transaction);
  }

  const response = await query
    .where('usersupplierrole.supplier', accountId)
    .where('usersupplierrole.user', userId)
    .first();

  return response && response.role > 0;
};

module.exports = UserSupplierRoleModel;
