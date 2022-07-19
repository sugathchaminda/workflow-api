exports.seed = (knex) =>
  // Deletes ALL existing entries
  // eslint-disable-next-line implicit-arrow-linebreak
  knex('invite')
    .del()
    .then(() =>
      // Inserts seed entries
      // eslint-disable-next-line implicit-arrow-linebreak
      knex('invite').insert([
        {
          token: 'test+invite1-valid-token',
          inviter: 1,
          invitee: 'test+invite1@prototyp.se',
          supplier: 1,
          valid_until: '2399-01-01 00:00:00',
          used_at: null,
          supplier_data: null,
          permissions: JSON.stringify(['admin']),
          source: 'request',
        },
        {
          token: 'test+invite2-valid-token',
          inviter: 2,
          invitee: 'test+invite1@prototyp.se',
          supplier: 1,
          valid_until: '2399-01-01 00:00:00',
          used_at: null,
          supplier_data: null,
          permissions: JSON.stringify(['admin']),
          source: 'request',
        },
      ]));
