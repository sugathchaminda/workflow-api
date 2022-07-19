const { enums } = require('../../../../src/enums/tagMapObjectTypes');

const addDimensionsOneObjectTypeReq = [
  {
    accountId: 10,
    objectId: 1,
    objectType: enums.incoming_invoice,
    dimensions: [
      {
        tag: 2,
        column: '',
        value: {
          amount: 45,
          percentage: 45,
        },
      },
    ],
  },
  {
    accountId: 10,
    objectId: 1,
    objectType: enums.incoming_invoice_item,
    dimensions: [
      {
        tag: 2,
        column: '',
        value: {
          amount: 45,
          percentage: 45,
        },
      },
    ],
  },
];

const addDimensionsOneObjectTypeRes = {
  message: 'More than one object type in the data',
};

const addDimensionsOneInvoiceReq = [
  {
    accountId: 10,
    objectId: 1,
    objectType: enums.incoming_invoice,
    dimensions: [
      {
        tag: 2,
        column: '',
        value: {
          amount: 45,
          percentage: 45,
        },
      },
    ],
  },
  {
    accountId: 10,
    objectId: 2,
    objectType: enums.incoming_invoice,
    dimensions: [
      {
        tag: 2,
        column: '',
        value: {
          amount: 45,
          percentage: 45,
        },
      },
    ],
  },
];

const addDimensionsOneInvoiceRes = {
  message: 'More than one invoice in the data',
};

const addDimensionsAlreadyExistsReq = [
  {
    accountId: 10,
    objectId: 1,
    objectType: enums.incoming_invoice_item,
    dimensions: [
      {
        tag: 2,
        column: '',
        value: {
          amount: 45,
          percentage: 45,
        },
      },
    ],
  },
];

const addDimensionsAlreadyExistsRes = {
  message: 'One of the tag is already tagged to the given object ID',
};

const addDimensionsTagsNotBelongToAccountReq = [
  {
    accountId: 10,
    objectId: 1,
    objectType: enums.incoming_invoice,
    dimensions: [
      {
        tag: 22,
        column: '',
        value: {
          amount: 45,
          percentage: 45,
        },
      },
    ],
  },
];

const addDimensionsTagsNotBelongToAccountRes = {
  message: 'One or more entered tags do not exist for the account',
};

const addDimensionsTagTypesNotAllowedReq = [
  {
    accountId: 10,
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

const addDimensionsTagTypesNotAllowedRes = {
  message: 'Cannot enter custom tag types for dimensions',
};

const addDimensionsInvoiceNotBelongsToAccountReq = [
  {
    accountId: 10,
    objectId: 100,
    objectType: enums.incoming_invoice,
    dimensions: [
      {
        tag: 2,
        column: '',
        value: {
          amount: 45,
          percentage: 45,
        },
      },
    ],
  },
];

const addDimensionsInvoiceNotBelongsToAccountRes = {
  message: 'Invoice does not belong to this account',
};

const addDimensionsInvoiceItemsNotBelongToAccountReq = [
  {
    accountId: 10,
    objectId: 100,
    objectType: enums.incoming_invoice_item,
    dimensions: [
      {
        tag: 2,
        column: '',
        value: {
          amount: 45,
          percentage: 45,
        },
      },
    ],
  },
];

const addDimensionsInvoiceItemsNotBelongToAccountRes = {
  message: 'Invoice item does not belong to this account',
};

const addDimensionsTotalPercentageCheckReq = [
  {
    accountId: 10,
    objectId: 1,
    objectType: enums.incoming_invoice,
    dimensions: [
      {
        tag: 2,
        column: '',
        value: {
          amount: 45,
          percentage: 101,
        },
      },
    ],
  },
];

const addDimensionsTotalPercentageCheckRes = {
  message: 'Total of the value percentages mapped to tags is higher than 100%',
};

const addDimensionsTotalValueCheckReq = [
  {
    accountId: 10,
    objectId: 1,
    objectType: enums.incoming_invoice,
    dimensions: [
      {
        tag: 2,
        column: '',
        value: {
          amount: 45000000,
          percentage: 54,
        },
      },
    ],
  },
];

const addDimensionsTotalValueCheckRes = {
  message:
    'Total of the values mapped to tags is higher than the invoice total amount',
};

const addDimensionsReq = [
  {
    accountId: 10,
    objectId: 1,
    objectType: enums.incoming_invoice,
    dimensions: [
      {
        tag: 2,
        column: '',
        value: {
          amount: 45,
          percentage: 45,
        },
      },
    ],
  },
];

const addDimensionsRes = {
  message: 'Dimensions saved successfully',
};

const updateDimensionsReq = [
  {
    accountId: 10,
    objectId: 1,
    objectType: enums.incoming_invoice,
    dimensions: [
      {
        tag: 2,
        column: '',
        value: {
          amount: 45,
          percentage: 45,
        },
      },
    ],
  },
];

const updateDimensionsRes = {
  message: 'Dimensions updated successfully',
};

const updateDimensionsOneObjectTypeReq = [
  {
    accountId: 10,
    objectId: 1,
    objectType: enums.incoming_invoice_item,
    dimensions: [
      {
        tag: 2,
        column: '',
        value: {
          amount: 45,
          percentage: 45,
        },
      },
    ],
  },
  {
    accountId: 10,
    objectId: 1,
    objectType: enums.incoming_invoice,
    dimensions: [
      {
        tag: 2,
        column: '',
        value: {
          amount: 45,
          percentage: 45,
        },
      },
    ],
  },
];

const updateDimensionsOneObjectTypeRes = {
  statusCode: 422,
  error: 'Unprocessable Entity',
  message: 'More than one object type in the data',
};

const updateDimensionsOneInvoiceReq = [
  {
    accountId: 10,
    objectId: 1,
    objectType: enums.incoming_invoice,
    dimensions: [
      {
        tag: 2,
        column: '',
        value: {
          amount: 45,
          percentage: 45,
        },
      },
    ],
  },
  {
    accountId: 10,
    objectId: 2,
    objectType: enums.incoming_invoice,
    dimensions: [
      {
        tag: 2,
        column: '',
        value: {
          amount: 45,
          percentage: 45,
        },
      },
    ],
  },
];

const updateDimensionsOneInvoiceRes = {
  statusCode: 422,
  error: 'Unprocessable Entity',
  message: 'More than one invoice in the data',
};

const updateDimensionsTagsNotBelongToAccountReq = [
  {
    accountId: 10,
    objectId: 1,
    objectType: enums.incoming_invoice_item,
    dimensions: [
      {
        tag: 200,
        column: '',
        value: {
          amount: 45,
          percentage: 45,
        },
      },
    ],
  },
];

const updateDimensionsTagsNotBelongToAccountRes = {
  statusCode: 422,
  error: 'Unprocessable Entity',
  message: 'One or more entered tags do not exist for the account',
};

const updateDimensionsTagTypesNotAllowedReq = [
  {
    accountId: 10,
    objectId: 1,
    objectType: enums.incoming_invoice_item,
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

const updateDimensionsTagTypesNotAllowedRes = {
  statusCode: 422,
  error: 'Unprocessable Entity',
  message: 'Cannot enter custom tag types for dimensions',
};

const updateDimensionsInvoiceNotBelongsToAccountReq = [
  {
    accountId: 10,
    objectId: 100,
    objectType: enums.incoming_invoice,
    dimensions: [
      {
        tag: 2,
        column: '',
        value: {
          amount: 45,
          percentage: 45,
        },
      },
    ],
  },
];

const updateDimensionsInvoiceNotBelongsToAccountRes = {
  statusCode: 422,
  error: 'Unprocessable Entity',
  message: 'Invoice does not belong to this account',
};

const updateDimensionsInvoiceItemsNotBelongToAccountReq = [
  {
    accountId: 10,
    objectId: 100,
    objectType: enums.incoming_invoice_item,
    dimensions: [
      {
        tag: 2,
        column: '',
        value: {
          amount: 45,
          percentage: 45,
        },
      },
    ],
  },
];

const updateDimensionsInvoiceItemsNotBelongToAccountRes = {
  statusCode: 422,
  error: 'Unprocessable Entity',
  message: 'Invoice item does not belong to this account',
};

const updateDimensionsTotalPercentageCheckReq = [
  {
    accountId: 10,
    objectId: 1,
    objectType: enums.incoming_invoice_item,
    dimensions: [
      {
        tag: 2,
        column: '',
        value: {
          amount: 45,
          percentage: 45,
        },
      },
      {
        tag: 3,
        column: '',
        value: {
          amount: 45,
          percentage: 58,
        },
      },
    ],
  },
];

const updateDimensionsTotalPercentageCheckRes = {
  statusCode: 422,
  error: 'Unprocessable Entity',
  message:
    'Total of the value percentages mapped to the dimension is higher than 100%',
};

const updateDimensionsTotalValueCheckReq = [
  {
    accountId: 10,
    objectId: 1,
    objectType: enums.incoming_invoice_item,
    dimensions: [
      {
        tag: 2,
        column: '',
        value: {
          amount: 45,
          percentage: 45,
        },
      },
      {
        tag: 3,
        column: '',
        value: {
          amount: 45000000,
          percentage: 54,
        },
      },
    ],
  },
];

const updateDimensionsTotalValueCheckRes = {
  statusCode: 422,
  error: 'Unprocessable Entity',
  message:
    'Total of the values mapped to the dimension is higher than the invoice total amount',
};

const invoiceNotBelongsToUserReq = {
  accountId: 25,
  invoiceId: 54,
  tagIds: [19600],
};

const invoiceNotBelongsToUserRes = {
  message: 'Invoice not belongs to this account',
  error: 'Unprocessable Entity',
  statusCode: 422,
};

const deleteDimensionsNotBelongsReq = {
  accountId: 10,
  invoiceId: 1,
  tagIds: [11],
};

const deleteDimensionsNotBelongsRes = {
  statusCode: 422,
  error: 'Unprocessable Entity',
  message: 'Some of the dimensions are not belongs to this account',
};

const deleteDimensionsReq = {
  accountId: 10,
  invoiceId: 1,
  tagIds: [10],
};

const deleteDimensionsRes = {
  message: 'Dimensions deleted successfully',
};

module.exports = {
  addDimensionsOneObjectTypeReq,
  addDimensionsOneObjectTypeRes,
  addDimensionsOneInvoiceReq,
  addDimensionsOneInvoiceRes,
  addDimensionsAlreadyExistsReq,
  addDimensionsAlreadyExistsRes,
  addDimensionsTagsNotBelongToAccountReq,
  addDimensionsTagsNotBelongToAccountRes,
  addDimensionsTagTypesNotAllowedReq,
  addDimensionsTagTypesNotAllowedRes,
  addDimensionsInvoiceNotBelongsToAccountReq,
  addDimensionsInvoiceNotBelongsToAccountRes,
  addDimensionsInvoiceItemsNotBelongToAccountReq,
  addDimensionsInvoiceItemsNotBelongToAccountRes,
  addDimensionsTotalPercentageCheckReq,
  addDimensionsTotalPercentageCheckRes,
  addDimensionsTotalValueCheckReq,
  addDimensionsTotalValueCheckRes,
  addDimensionsReq,
  addDimensionsRes,
  updateDimensionsReq,
  updateDimensionsRes,
  updateDimensionsOneObjectTypeReq,
  updateDimensionsOneObjectTypeRes,
  updateDimensionsOneInvoiceReq,
  updateDimensionsOneInvoiceRes,
  updateDimensionsTagsNotBelongToAccountReq,
  updateDimensionsTagsNotBelongToAccountRes,
  updateDimensionsTagTypesNotAllowedReq,
  updateDimensionsTagTypesNotAllowedRes,
  updateDimensionsInvoiceNotBelongsToAccountReq,
  updateDimensionsInvoiceNotBelongsToAccountRes,
  updateDimensionsInvoiceItemsNotBelongToAccountReq,
  updateDimensionsInvoiceItemsNotBelongToAccountRes,
  updateDimensionsTotalPercentageCheckReq,
  updateDimensionsTotalPercentageCheckRes,
  updateDimensionsTotalValueCheckReq,
  updateDimensionsTotalValueCheckRes,
  invoiceNotBelongsToUserReq,
  invoiceNotBelongsToUserRes,
  deleteDimensionsNotBelongsReq,
  deleteDimensionsNotBelongsRes,
  deleteDimensionsReq,
  deleteDimensionsRes,
};
