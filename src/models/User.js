/* eslint-disable func-names */
const Model = require('../model');

const UserModel = new Model('user');

// UserModel Specific Functions (write the functions as member functions)
// ex: UserModel.create = function () {} -> use normal function instead of arrow function

UserModel.fetchUserByName = async function (nameText) {
  const response = await this.getQueryBuilder().whereRaw(
    "LOWER(name) LIKE '%' || LOWER(?) || '%'",
    nameText
  );

  return response;
};

UserModel.fetchUserById = async function (userId) {
  const response = await this.getQueryBuilder()
    .where('user.id', userId)
    .first();

  return response;
};

UserModel.fetchUserByEmail = async function (email) {
  const response = await this.getQueryBuilder().where('user.email', email);

  return response;
};

module.exports = UserModel;
