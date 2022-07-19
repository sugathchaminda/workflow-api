/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
/* eslint-disable consistent-return */
const uuid = require('uuid');
const {
  Tag,
  TagMap,
  InvoiceWorkflow,
  IncomingInvoiceItem,
} = require('../../models/index');
const ApplicationError = require('../../utils/ApplicationError');
const errorHelper = require('../../utils/errorHelper');
const { parseAccountId } = require('../../utils/parseHelper');
const { enums } = require('../../enums/tagMapObjectTypes');

const validateDimensions = async (attributes) => {
  const existingDimensions = [];

  for (let x = 0; x < attributes.length; x += 1) {
    const result = await TagMap.findExistingDimension(
      attributes[x].tag,
      attributes[x].object_type,
      attributes[x].object_id
    );
    existingDimensions.push(result);
  }

  // filter out undefined and null values
  const finalExistingDimensions = existingDimensions.filter(
    (dimension) => dimension !== undefined && dimension !== null
  );

  if (finalExistingDimensions.length > 0) {
    return true;
  }
  return false;
};

const validateTags = async (accountId, tagIds) => {
  // all entered tags should be available for the account
  // cannot enter custom tag types for dimensions
  const tags = await Tag.getByIds(accountId, tagIds);

  if (tags.length !== tagIds.length) {
    throw new ApplicationError({
      message: 'One or more entered tags do not exist for the account',
      statusCode: 422,
    });
  }

  for (let l = 0; l < tags.length; l += 1) {
    if (tags[l].parent === null && tags[l].type.toLowerCase() === 'label') {
      throw new ApplicationError({
        message: 'Cannot enter custom tag types for dimensions',
        statusCode: 422,
      });
    }
  }
};

const validateInvoiceDimensionValues = async (
  accountId,
  objectId,
  dimensions
) => {
  // the total percentage of a dimension should be equal or less than 100%
  // the total value assigned to a dimension should be equal or less than total invoice amount
  let valuePercentageTotal = 0;
  let valueAmountTotal = 0;

  dimensions.forEach((dimension) => {
    valuePercentageTotal += dimension.value.percentage;
    valueAmountTotal += dimension.value.amount;
  });

  if (valuePercentageTotal > 100) {
    throw new ApplicationError({
      message:
        'Total of the value percentages mapped to tags is higher than 100%',
      statusCode: 422,
    });
  }

  const invoiceTotal = await InvoiceWorkflow.getInvoiceTotalAmount(
    accountId,
    objectId
  );

  if (valueAmountTotal > parseFloat(invoiceTotal)) {
    throw new ApplicationError({
      message:
        'Total of the values mapped to tags is higher than the invoice total amount',
      statusCode: 422,
    });
  }
};

const validateInvoiceItemDimensionValues = async (objectId, dimensions) => {
  // the total percentage of a dimension should be equal or less than 100%
  // the total value assigned to a dimension should be equal or less than total invoice item amount
  let valuePercentageTotal = 0;
  let valueAmountTotal = 0;

  dimensions.forEach((dimension) => {
    valuePercentageTotal += dimension.value.percentage;
    valueAmountTotal += dimension.value.amount;
  });

  if (valuePercentageTotal > 100) {
    throw new ApplicationError({
      message:
        'Total of the value percentages mapped to the dimension is higher than 100%',
      statusCode: 422,
    });
  }

  const incomingInvoiceItemTotal = await IncomingInvoiceItem.getLineItemTotal(
    objectId
  );

  if (valueAmountTotal > incomingInvoiceItemTotal) {
    throw new ApplicationError({
      message:
        'Total of the values mapped to the dimension is higher than the invoice total amount',
      statusCode: 422,
    });
  }
};

const addDimensions = async (attributes) => {
  const accountId = parseAccountId(attributes[0].accountId);
  const objectIds = [];
  const objectTypes = [];
  const tagIds = [];

  const dimensionsArray = attributes.map((attribute) => {
    objectIds.push(attribute.objectId);
    objectTypes.push(attribute.objectType);

    const tagMap = attribute.dimensions.map((dimension) => {
      tagIds.push(dimension.tag);

      const tagMapObj = {};
      tagMapObj.uuid = uuid.v4();
      tagMapObj.account = accountId;
      tagMapObj.object_id = attribute.objectId;
      tagMapObj.object_type = attribute.objectType.toLowerCase();
      tagMapObj.column = dimension.column;
      tagMapObj.value = dimension.value;
      tagMapObj.tag = dimension.tag;

      return tagMapObj;
    });
    return tagMap;
  });

  // get unique tagIds
  const uniqueTagIdsSet = new Set(tagIds);
  const uniqueTagIds = Array.from(uniqueTagIdsSet);

  // all entered tags should be available for the account
  // cannot enter custom tag types for dimensions
  await validateTags(accountId, uniqueTagIds);

  // get unique objectIds
  const uniqueObjectIdsSet = new Set(objectIds);
  const uniqueObjectIds = Array.from(uniqueObjectIdsSet);

  // get unique objectTypes
  const uniqueObjectTypesSet = new Set(objectTypes);
  const uniqueObjectTypes = Array.from(uniqueObjectTypesSet);

  // there should be one object type coming into the function in a one function call
  // if the 'uniqueObjectTypes' has more than one value, it means more than one object type is coming in the service call
  if (uniqueObjectTypes.length !== 1) {
    throw new ApplicationError({
      message: 'More than one object type in the data',
      statusCode: 422,
    });
  }

  // if the object type is 'incominginvoice', only one invoice can get dimensions created from a one function call
  if (
    uniqueObjectTypes[0] === enums.incoming_invoice
    && uniqueObjectIds.length !== 1
  ) {
    throw new ApplicationError({
      message: 'More than one invoice in the data',
      statusCode: 422,
    });
  }

  const dimensionsArrayFinal = dimensionsArray.flat(1);

  // the dimension should not already exist
  const validateDimensionsRes = await validateDimensions(dimensionsArrayFinal);

  if (validateDimensionsRes) {
    throw new ApplicationError({
      message: 'One of the tag is already tagged to the given object ID',
      statusCode: 422,
    });
  }

  // the total percentage of a dimension should be equal or less than 100%
  // the total value assigned to a dimension should be equal or less than total invoice amount or total invoice item amount
  for (let i = 0; i < attributes.length; i += 1) {
    const attribute = attributes[i];

    if (attribute.objectType.toLowerCase() === enums.incoming_invoice) {
      // check invoice belongs to a given account
      const isValidInvoice = await InvoiceWorkflow.isInvoiceBelongsToAccount(
        accountId,
        attribute.objectId
      );

      if (!isValidInvoice) {
        throw new ApplicationError({
          message: 'Invoice does not belong to this account',
          statusCode: 422,
        });
      }

      await validateInvoiceDimensionValues(
        accountId,
        attribute.objectId,
        attribute.dimensions
      );
    } else if (
      attribute.objectType.toLowerCase() === enums.incoming_invoice_item
    ) {
      // check invoice item belongs to a given account
      const isValidInvoiceItem = await IncomingInvoiceItem.isInvoiceItemBelongsToAccount(
        accountId,
        attribute.objectId
      );

      if (!isValidInvoiceItem) {
        throw new ApplicationError({
          message: 'Invoice item does not belong to this account',
          statusCode: 422,
        });
      }

      await validateInvoiceItemDimensionValues(
        attribute.objectId,
        attribute.dimensions
      );
    }
  }

  await TagMap.create(dimensionsArrayFinal);
  return {
    message: 'Dimensions saved successfully',
  };
};

const deleteDimensionByObjectTypeObjectIds = async (
  accountId,
  objectType,
  objectIds
) => {
  const existingDimensions = [];

  for (let x = 0; x < objectIds.length; x += 1) {
    const result = TagMap.findTagMapForUserByObjectTypeObjectId(
      accountId,
      objectType,
      objectIds[x]
    );
    existingDimensions.push(result);
  }

  const existingDimensionsResolved = await Promise.all(existingDimensions);
  const existingDimensionsResolvedFinal = existingDimensionsResolved.flat(1);

  // filter out undefined and null values
  const finalExistingDimensions = existingDimensionsResolvedFinal.filter(
    (dimension) => dimension !== undefined && dimension !== null
  );
  if (finalExistingDimensions.length > 0) {
    // get the uuids of existing dimensions
    const uuids = finalExistingDimensions.map(
      (existingDimension) => existingDimension.uuid
    );

    await TagMap.deleteTagMapByUUIDs(accountId, uuids);

    return true;
  }

  return false;
};

const updateDimensions = async (attributes) => {
  const accountId = parseAccountId(attributes[0].accountId);
  const objectIds = [];
  const objectTypes = [];
  const tagIds = [];

  const dimensionsArray = attributes.map((attribute) => {
    objectIds.push(attribute.objectId);
    objectTypes.push(attribute.objectType);

    const tagMap = attribute.dimensions.map((dimension) => {
      tagIds.push(dimension.tag);

      const tagMapObj = {};
      tagMapObj.uuid = uuid.v4();
      tagMapObj.account = accountId;
      tagMapObj.object_id = attribute.objectId;
      tagMapObj.object_type = attribute.objectType.toLowerCase();
      tagMapObj.column = dimension.column;
      tagMapObj.value = dimension.value;
      tagMapObj.tag = dimension.tag;

      return tagMapObj;
    });
    return tagMap;
  });

  // get unique tagIds
  const uniqueTagIdsSet = new Set(tagIds);
  const uniqueTagIds = Array.from(uniqueTagIdsSet);

  // all entered tags should be available for the account
  // cannot enter custom tag types for dimensions
  await validateTags(accountId, uniqueTagIds);

  // get unique objectIds
  const uniqueObjectIdsSet = new Set(objectIds);
  const uniqueObjectIds = Array.from(uniqueObjectIdsSet);

  // get unique objectTypes
  const uniqueObjectTypesSet = new Set(objectTypes);
  const uniqueObjectTypes = Array.from(uniqueObjectTypesSet);

  // there should be one object type coming into the function in a one function call
  // if the 'uniqueObjectTypes' has more than one value, it means more than one object type is coming in the service call
  if (uniqueObjectTypes.length !== 1) {
    throw new ApplicationError({
      message: 'More than one object type in the data',
      statusCode: 422,
    });
  }

  // if the object type is 'incominginvoice', only one invoice can get dimensions created from a one function call
  if (
    uniqueObjectTypes[0] === enums.incoming_invoice
    && uniqueObjectIds.length !== 1
  ) {
    throw new ApplicationError({
      message: 'More than one invoice in the data',
      statusCode: 422,
    });
  }

  const dimensionsArrayFinal = dimensionsArray.flat(1);

  // the total percentage of a dimension should be equal or less than 100%
  // the total value assigned to a dimension should be equal or less than total invoice amount or total invoice item amount
  for (let i = 0; i < attributes.length; i += 1) {
    const attribute = attributes[i];

    if (attribute.objectType.toLowerCase() === enums.incoming_invoice) {
      // check invoice belongs to a given account
      const isValidInvoice = await InvoiceWorkflow.isInvoiceBelongsToAccount(
        accountId,
        attribute.objectId
      );

      if (!isValidInvoice) {
        throw new ApplicationError({
          message: 'Invoice does not belong to this account',
          statusCode: 422,
        });
      }

      await validateInvoiceDimensionValues(
        accountId,
        attribute.objectId,
        attribute.dimensions
      );
    } else if (
      attribute.objectType.toLowerCase() === enums.incoming_invoice_item
    ) {
      // check invoice item belongs to a given account
      const isValidInvoiceItem = await IncomingInvoiceItem.isInvoiceItemBelongsToAccount(
        accountId,
        attribute.objectId
      );

      if (!isValidInvoiceItem) {
        throw new ApplicationError({
          message: 'Invoice item does not belong to this account',
          statusCode: 422,
        });
      }

      await validateInvoiceItemDimensionValues(
        attribute.objectId,
        attribute.dimensions
      );
    }
  }

  // after all the validations are passed, find and delete the dimensions existing for the given account, object type and object ids
  await deleteDimensionByObjectTypeObjectIds(
    accountId,
    uniqueObjectTypes[0],
    uniqueObjectIds
  );

  await TagMap.create(dimensionsArrayFinal);
  return {
    message: 'Dimensions updated successfully',
  };
};

const deleteDimensions = async (attributes) => {
  const accountId = parseAccountId(attributes.accountId);
  const invoiceId = parseInt(attributes.invoiceId, 10);
  const { tagIds: tagMapIds } = attributes;

  try {
    // check invoice belongs to a given account
    const isValidInvoice = await InvoiceWorkflow.isInvoiceBelongsToAccount(
      accountId,
      invoiceId
    );

    if (!isValidInvoice) {
      return errorHelper({
        message: 'Invoice not belongs to this account',
        statusCode: 422,
      }).payload;
    }

    // check demensions are belongs to user
    const isBelongsAllDimensions = await TagMap.checkTagMapsBelongsToSupplier(
      tagMapIds,
      accountId
    );

    if (!isBelongsAllDimensions) {
      return errorHelper({
        message: 'Some of the dimensions are not belongs to this account',
        statusCode: 422,
      }).payload;
    }

    // delete dimensions
    await TagMap.deleteTagMaps(tagMapIds);

    return {
      message: 'Dimensions deleted successfully',
    };
  } catch (e) {
    console.log('deleteDimension has failed: ', e);
    return errorHelper({
      message: 'Delete dimensions has failed',
      statusCode: 500,
    }).payload;
  }
};

module.exports = {
  addDimensions,
  updateDimensions,
  deleteDimensions,
};
