const Model = require('../model');

const SupplierModel = new Model('supplier');

SupplierModel.getSupplierById = async (supplierId, columns = ['*']) => SupplierModel.getQueryBuilder()
  .where('id', '=', supplierId)
  .select(columns)
  .first();

module.exports = SupplierModel;
