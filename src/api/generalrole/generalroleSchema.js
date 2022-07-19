const Joi = require('@hapi/joi');

const isRoleAvailable = () => Joi.object().keys({
  accountId: Joi.string().required(),
  role: Joi.string().required().max(50),
  id: Joi.number().optional(),
});

const createGeneralRole = () => Joi.object().keys({
  accountId: Joi.string().required(),
  role: Joi.string().required().max(50),
  permissions: Joi.array().items(Joi.number().integer()),
});

const indexGeneralRole = () => Joi.object().keys({
  accountId: Joi.string().required(),
  page: Joi.number().integer(),
});

const editGeneralRole = () => Joi.object().keys({
  accountId: Joi.string().required(),
  role: Joi.string().required().max(50),
  roleId: Joi.string().required(),
  permissions: Joi.array().items(Joi.number().integer()),
});

const deleteGeneralRole = () => Joi.object().keys({
  accountId: Joi.string().required(),
  roleId: Joi.string().required(),
});

module.exports = {
  isRoleAvailable,
  createGeneralRole,
  indexGeneralRole,
  editGeneralRole,
  deleteGeneralRole,
};
