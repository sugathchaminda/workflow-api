/* eslint-disable */
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, `./test/testEnv.local`);

if (fs.existsSync(filePath)) {
  require('dotenv').config({
    path: filePath,
  });
}

const client = {
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: process.env.PG_PORT,
};

console.log('client', client);

module.exports = {
  client: 'pg',
  connection: client,
};
