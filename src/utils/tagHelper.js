const { Tag } = require('../models/index');
const { parseAccountId } = require('./parseHelper');

const getInvoiceDimensions = async (attributes) => {
  const invoiceId = parseInt(attributes.invoiceId, 10);
  const accountId = parseAccountId(attributes.accountId);

  const customDimensionsQuery = Tag.getQueryBuilder()
    .innerJoin('tagmap', 'tag.id', '=', 'tagmap.tag')
    .innerJoin('tag as parent', 'tag.parent', '=', 'parent.id')
    .where('tagmap.object_id', invoiceId)
    .where('tagmap.object_type', 'incominginvoice')
    .where('tag.account', accountId)
    .whereNot('tag.parent', null)
    .select([
      'tag',
      'tag.label',
      'tag.context',
      'tag.meta_data',
      'tag.type',
      'tag.deleted',
      'tagmap.id as tagMapId',
      'tagmap.column',
      'tagmap.object_id as objectId',
      'tagmap.object_type as objectType',
      'tagmap.value',
      'parent.label as parentTag',
    ]);

  const systemDimensionsQuery = Tag.getQueryBuilder()
    .innerJoin('tagmap', 'tag.id', '=', 'tagmap.tag')
    .innerJoin('tagcategory', 'tagcategory.type', '=', 'tag.type')
    .where('tagmap.object_id', invoiceId)
    .where('tagmap.object_type', 'incominginvoice')
    .where('tag.account', accountId)
    .where('tag.parent', null)
    .select([
      'tag',
      'tag.label',
      'tag.context',
      'tag.meta_data',
      'tag.type',
      'tag.deleted',
      'tagmap.id as tagMapId',
      'tagmap.column',
      'tagmap.object_id as objectId',
      'tagmap.object_type as objectType',
      'tagmap.value',
      'tagcategory.label as parentTag',
    ]);

  let allDimensions = await Promise.all([
    systemDimensionsQuery,
    customDimensionsQuery,
  ]);
  allDimensions = allDimensions[0].concat(allDimensions[1]);
  const tagTypes = Array.from(new Set(allDimensions.map((t) => t.parentTag)));
  const dimensions = [];

  tagTypes.forEach((type) => {
    const childTags = allDimensions.filter((t) => t.parentTag === type);
    let total = 0;

    childTags.forEach((tag) => {
      if (tag.value && tag.value.amount) {
        total += tag.value.amount;
      }
    });

    const tagType = {
      objectType: 'incominginvoice',
      objectId: invoiceId,
      parentTag: type,
      dimensions: childTags,
      amount: total,
    };

    dimensions.push(tagType);
  });

  return dimensions;
};

const getInvoiceDimensionsCount = (tags) => {
  if (tags.length) {
    let count = 0;
    tags.forEach((type) => {
      if (type.dimensions.length) {
        count += type.dimensions.length;
      }
    });
    return count;
  }
  return 0;
};

const getInvoiceItemDimensions = async (attributes, invoiceItemId) => {
  const accountId = parseAccountId(attributes.accountId);

  const customDimensionsQuery = await Tag.getQueryBuilder()
    .innerJoin('tagmap', 'tag.id', '=', 'tagmap.tag')
    .innerJoin('tag as parent', 'tag.parent', '=', 'parent.id')
    .where('tagmap.object_id', invoiceItemId)
    .where('tagmap.object_type', 'incominginvoiceitem')
    .where('tag.account', accountId)
    .whereNot('tag.parent', null)
    .select([
      'tag',
      'tag.label',
      'tag.context',
      'tag.meta_data',
      'tag.type',
      'tag.deleted',
      'tagmap.id as tagMapId',
      'tagmap.column',
      'tagmap.object_id as objectId',
      'tagmap.object_type as objectType',
      'tagmap.value',
      'parent.label as parentTag',
    ]);

  const systemDimensionsQuery = await Tag.getQueryBuilder()
    .innerJoin('tagmap', 'tag.id', '=', 'tagmap.tag')
    .innerJoin('tagcategory', 'tagcategory.type', '=', 'tag.type')
    .where('tagmap.object_id', invoiceItemId)
    .where('tagmap.object_type', 'incominginvoiceitem')
    .where('tag.account', accountId)
    .where('tag.parent', null)
    .select([
      'tag',
      'tag.label',
      'tag.context',
      'tag.meta_data',
      'tag.type',
      'tag.deleted',
      'tagmap.id as tagMapId',
      'tagmap.column',
      'tagmap.object_id as objectId',
      'tagmap.object_type as objectType',
      'tagmap.value',
      'tagcategory.label as parentTag',
    ]);

  let allDimensions = await Promise.all([
    systemDimensionsQuery,
    customDimensionsQuery,
  ]);
  allDimensions = allDimensions[0].concat(allDimensions[1]);
  const tagTypes = Array.from(new Set(allDimensions.map((t) => t.parentTag)));
  const dimensions = [];

  tagTypes.forEach((type) => {
    const childTags = allDimensions.filter((t) => t.parentTag === type);
    let total = 0;

    childTags.forEach((tag) => {
      if (tag.value && tag.value.amount) {
        total += tag.value.amount;
      }
    });

    const tagType = {
      objectType: 'incominginvoiceitem',
      objectId: invoiceItemId,
      parentTag: type,
      dimensions: childTags,
      amount: total,
    };

    dimensions.push(tagType);
  });

  return dimensions;
};

const isInvoiceItemHasDimensions = async (invoiceItems) => {
  let noOfItemTags = 0;

  invoiceItems.forEach((invoiceItem) => {
    noOfItemTags += invoiceItem.invoiceItemTags.length;
  });

  return noOfItemTags > 0;
};

module.exports = {
  getInvoiceDimensions,
  getInvoiceItemDimensions,
  getInvoiceDimensionsCount,
  isInvoiceItemHasDimensions,
};
