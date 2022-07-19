const fetchUserWorkflowAliasForSupplier = () => Promise.resolve([
  {
    id: 1,
    user: 7,
    alias: 1,
    active: true,
    text: 'CEO',
    supplier: 3,
  },
  {
    id: 3,
    user: 3,
    alias: 2,
    active: true,
    text: 'CTO',
    supplier: 3,
  },
  {
    id: 2,
    user: 7,
    alias: 3,
    active: true,
    text: 'HT',
    supplier: 3,
  },
  {
    id: 4,
    user: 3,
    alias: 4,
    active: true,
    text: 'AW',
    supplier: 3,
  },
]);

module.exports = {
  fetchUserWorkflowAliasForSupplier,
};
