/* eslint-disable no-undef */
const jest = require('jest');
const path = require('path');

let envSuffix = '';
switch (process.env.APP_ENV) {
  case 'dev':
    envSuffix = '.dev';
    break;
  case 'local':
    envSuffix = '.local';
    break;
  default:
    envSuffix = '.local';
}
require('dotenv').config({
  path: path.join(__dirname, `testEnv${envSuffix}`),
});

async function runTests() {
  // eslint-disable-next-line no-useless-catch
  try {
    await jest.run('./test/.*.test.js$ --verbose --runInBand');
    return;
  } catch (error) {
    throw error;
  }
}

runTests();
