const Joi = require('@hapi/joi');
const { enumValues } = require('../../enums/tagMapObjectTypes');

const addDimensions = () => Joi.array().items({
  accountId: Joi.string()
    .required()
    .error(new Error('accountId is required')),
  objectId: Joi.number().required().error(new Error('objectId is required')),
  objectType: Joi.string()
    .valid(enumValues)
    .required()
    .error(
      new Error('objectType is required or invalid objectType provided')
    ),
  dimensions: Joi.array()
    .required()
    .items({
      tag: Joi.number().required().error(new Error('tag is required')),
      value: Joi.object()
        .required()
        .keys({
          amount: Joi.number()
            .required()
            .error(new Error('amount is required')),
          percentage: Joi.number()
            .required()
            .error(new Error('percentage is required')),
        }),
    }),
});

const updateDimensions = () => Joi.array().items({
  accountId: Joi.string()
    .required()
    .error(new Error('accountId is required')),
  objectId: Joi.number().required().error(new Error('objectId is required')),
  objectType: Joi.string()
    .valid(enumValues)
    .required()
    .error(
      new Error('objectType is required or invalid objectType provided')
    ),
  dimensions: Joi.array()
    .required()
    .items({
      tag: Joi.number().required().error(new Error('tag is required')),
      value: Joi.object()
        .required()
        .keys({
          amount: Joi.number()
            .required()
            .error(new Error('amount is required')),
          percentage: Joi.number()
            .required()
            .error(new Error('percentage is required')),
        }),
    }),
});

const deleteDimensions = () => Joi.object().keys({
  accountId: Joi.string()
    .required()
    .error(new Error('account id is required')),
  invoiceId: Joi.number()
    .required()
    .error(new Error('invoice id is required')),
  tagIds: Joi.array()
    .items(Joi.number())
    .required()
    .error(new Error('ids should be a number array')),
});

module.exports = {
  addDimensions,
  updateDimensions,
  deleteDimensions,
};
