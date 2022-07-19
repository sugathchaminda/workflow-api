const Joi = require('@hapi/joi');
const { allowedOperationsEnum } = require('../../enums/accounting');
const { vatTypesList } = require('../../enums/accounting');

const categoryService = Joi.object()
  .keys({
    code: Joi.number().required(),
    operation: Joi.string()
      .only([allowedOperationsEnum.added, allowedOperationsEnum.deleted])
      .required(),
  })
  .min(1)
  .required();

const mappingService = Joi.array()
  .unique((a, b) => a.account_number === b.account_number)
  .items({
    account_number: Joi.string().required(),
    categories: Joi.array()
      .unique((a, b) => a.code === b.code && a.operation === b.operation)
      .items(categoryService)
      .required(),
  })
  .min(1)
  .required();

const uploadChartOfAccountSignedUrl = () => Joi.object().keys({
  accountId: Joi.string()
    .required()
    .error(new Error('accountId is required')),
});

const getChartOfAccounts = () => Joi.object().keys({
  accountId: Joi.string()
    .required()
    .error(new Error('accountId is required')),
  type: Joi.string().optional().allow(['mapping', 'accounts_list', '', null]),
});

const saveAccountsDraft = () => Joi.object().keys({
  accountId: Joi.string()
    .required()
    .error(new Error('accountId is required')),
  type: Joi.string().only(['save_draft', 'save_and_proceed']),
  accounts: Joi.when('type', {
    is: 'save_draft',
    then: Joi.array().items(
      Joi.object().keys({
        operation: Joi.string()
          .allow(['added', 'edited', 'deleted'])
          .only()
          .required(),
        deductibility: Joi.number()
          .min(0)
          .max(100)
          .optional()
          .allow(['', null]),
        vat_type: Joi.string()
          .allow([...vatTypesList, '', null])
          .only()
          .optional(),
        reference: Joi.number()
          .when('operation', {
            is: 'added',
            then: Joi.number().optional().allow([null, '']),
          })
          .when('operation', {
            is: 'edited',
            then: Joi.number().required().min(1),
          })
          .when('operation', {
            is: 'deleted',
            then: Joi.number().required().min(1),
          }),
        account_number: Joi.string()
          .when('operation', { is: 'added', then: Joi.string().required() })
          .when('operation', {
            is: 'edited',
            then: Joi.string().optional().allow([null, '']),
          })
          .when('operation', {
            is: 'deleted',
            then: Joi.string().optional().allow([null, '']),
          }),
        account_name: Joi.string()
          .when('operation', {
            is: 'added',
            then: Joi.string().optional().allow([null, '']),
          })
          .when('operation', {
            is: 'edited',
            then: Joi.optional().allow([null, '']),
          })
          .when('operation', {
            is: 'deleted',
            then: Joi.optional().allow([null, '']),
          }),
      })
    ),
    otherwise: Joi.array().items(
      Joi.object().keys({
        operation: Joi.string()
          .allow(['added', 'edited', 'deleted'])
          .only()
          .required(),
        deductibility: Joi.number()
          .min(0)
          .max(100)
          .optional()
          .allow(['', null]),
        vat_type: Joi.string()
          .allow([...vatTypesList, '', null])
          .only()
          .optional(),
        reference: Joi.number()
          .when('operation', {
            is: 'added',
            then: Joi.number().optional().allow([null, '']),
          })
          .when('operation', {
            is: 'edited',
            then: Joi.number().required().min(1),
          })
          .when('operation', {
            is: 'deleted',
            then: Joi.number().required().min(1),
          }),
        account_number: Joi.string()
          .when('operation', { is: 'added', then: Joi.string().required() })
          .when('operation', { is: 'edited', then: Joi.required() })
          .when('operation', {
            is: 'deleted',
            then: Joi.string().optional().allow([null, '']),
          }),
        account_name: Joi.string()
          .when('operation', { is: 'added', then: Joi.string().required() })
          .when('operation', { is: 'edited', then: Joi.required() })
          .when('operation', {
            is: 'deleted',
            then: Joi.optional().allow([null, '']),
          }),
      })
    ),
  }),
});

const getLandingPageInfo = () => Joi.object().keys({
  accountId: Joi.string()
    .required()
    .error(new Error('accountId is required')),
});

const autoPosting = () => Joi.object().keys({
  accountId: Joi.string()
    .required()
    .error(new Error('account id is required')),
  invoiceId: Joi.number()
    .required()
    .error(new Error('invoice id is required')),
});

const saveMappings = () => Joi.object().keys({
  accountId: Joi.string()
    .required()
    .error(new Error('accountId is required')),
  type: Joi.string().only(['save_and_proceed', 'save_draft']),
  mappings: Joi.any().when('type', {
    is: 'save_and_proceed',
    then: Joi.any().when(Joi.array().min(1), { then: mappingService }),
    otherwise: mappingService,
  }),
});

const getPostingResults = () => Joi.object().keys({
  accountId: Joi.string()
    .required()
    .error(new Error('account id is required')),
  invoiceId: Joi.number()
    .required()
    .error(new Error('invoice id is required')),
});

const getChartOfAccountMappings = () => Joi.object().keys({
  accountId: Joi.string()
    .required()
    .error(new Error('accountId is required')),
});

const publishMappings = () => Joi.object().keys({
  accountId: Joi.string()
    .required()
    .error(new Error('accountId is required')),
});

module.exports = {
  uploadChartOfAccountSignedUrl,
  getLandingPageInfo,
  getChartOfAccounts,
  saveAccountsDraft,
  autoPosting,
  saveMappings,
  getPostingResults,
  getChartOfAccountMappings,
  publishMappings,
};
