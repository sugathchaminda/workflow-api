const Joi = require('@hapi/joi');

const isRoleAvailable = () => Joi.object().keys({
  accountId: Joi.string().required(),
  parentId: Joi.string().required(),
  role: Joi.string().required().max(50),
});

const createWorkflowRole = () => Joi.object().keys({
  accountId: Joi.string().required(),
  parentId: Joi.string().required(),
  role: Joi.string().required().max(50),
  spendingLimit: Joi.number().positive().allow(0).allow(null)
    .precision(2),
});

const editWorkflowRole = () => Joi.object().keys({
  accountId: Joi.string().required(),
  roleId: Joi.string().required(),
  role: Joi.string().required().max(50),
  spendingLimit: Joi.number()
    .positive()
    .allow(0)
    .allow(null)
    .precision(2)
    .required(),
});

const deleteWorkflowRole = () => Joi.object().keys({
  accountId: Joi.string().required(),
  roleId: Joi.string().required(),
});

module.exports = {
  isRoleAvailable,
  createWorkflowRole,
  editWorkflowRole,
  deleteWorkflowRole,
};
