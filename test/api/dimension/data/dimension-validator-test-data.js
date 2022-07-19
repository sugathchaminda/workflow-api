const { enums } = require('../../../../src/enums/tagMapObjectTypes');

const addDimensionValidatorReq = {
  params: {
    accountId: '1',
  },
  body: [
    {
      objectId: 1,
      objectType: enums.incoming_invoice,
      dimensions: [
        {
          tag: 1,
          column: '',
          value: {
            amount: 45,
            percentage: 45,
          },
        },
      ],
    },
  ],
};

const addDimensionValidatorRes = [
  {
    accountId: '1',
    objectId: 1,
    objectType: enums.incoming_invoice,
    dimensions: [
      {
        tag: 1,
        column: '',
        value: {
          amount: 45,
          percentage: 45,
        },
      },
    ],
  },
];

const updateDimensionValidatorReq = {
  params: {
    accountId: '1',
  },
  body: [
    {
      objectId: 1,
      objectType: enums.incoming_invoice,
      dimensions: [
        {
          tag: 1,
          column: '',
          value: {
            amount: 45,
            percentage: 45,
          },
        },
      ],
    },
  ],
};

const updateDimensionValidatorRes = [
  {
    accountId: '1',
    objectId: 1,
    objectType: enums.incoming_invoice,
    dimensions: [
      {
        tag: 1,
        column: '',
        value: {
          amount: 45,
          percentage: 45,
        },
      },
    ],
  },
];

const deleteDimensionValidatorReq = {
  params: {
    accountId: '1',
    invoiceId: 1,
  },
  body: {
    ids: [1, 2, 3],
  },
};

const deleteDimensionValidatorRes = {
  accountId: '1',
  invoiceId: 1,
  tagIds: [1, 2, 3],
};

module.exports = {
  addDimensionValidatorReq,
  addDimensionValidatorRes,
  updateDimensionValidatorReq,
  updateDimensionValidatorRes,
  deleteDimensionValidatorReq,
  deleteDimensionValidatorRes,
};
