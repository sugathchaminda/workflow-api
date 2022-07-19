const fetchUserRolesForSupplier = () => Promise.resolve([
  {
    id: 4,
    user: 7,
    workflow_role: 1,
    active: true,
    name: 'CEO',
    role_type: 2,
    supplier: 3,
    parent: 0,
  },
  {
    id: 2,
    user: 3,
    workflow_role: 2,
    active: true,
    name: 'CTO',
    role_type: 2,
    supplier: 3,
    parent: 1,
  },
  {
    id: 6,
    user: 7,
    workflow_role: 5,
    active: true,
    name: 'Fin Executive',
    role_type: 1,
    supplier: 3,
    parent: 0,
  },
  {
    id: 7,
    user: 3,
    workflow_role: 5,
    active: true,
    name: 'Fin Executive',
    role_type: 1,
    supplier: 3,
    parent: 0,
  },
]);

module.exports = {
  fetchUserRolesForSupplier,
};
