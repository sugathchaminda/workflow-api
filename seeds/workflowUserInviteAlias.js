exports.seed = (knex) =>
  // Deletes ALL existing entries
  // eslint-disable-next-line implicit-arrow-linebreak
  knex('invite_workflow_alias')
    .del()
    .then(() =>
      // Inserts seed entries
      // eslint-disable-next-line implicit-arrow-linebreak
      knex('invite_workflow_alias').insert([
        {
          id: 1,
          invite: 1,
          alias: 'invite test',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          invite: 2,
          alias: 'slack chats with Charles',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]));
