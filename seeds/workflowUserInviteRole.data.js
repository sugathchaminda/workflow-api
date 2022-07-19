exports.seed = (knex) =>
  // Deletes ALL existing entries
  // eslint-disable-next-line implicit-arrow-linebreak
  knex('invite_workflow_role')
    .del()
    .then(() =>
      // Inserts seed entries
      // eslint-disable-next-line implicit-arrow-linebreak
      knex('invite_workflow_role').insert([
        {
          id: 1,
          invite: 1,
          workflow_role: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          invite: 2,
          workflow_role: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]));
