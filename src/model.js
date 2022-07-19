/* eslint-disable func-names */
const knex = require('./db');

/**
 * @description generic model constructor function which should be inherited by customer model classes
 * @param {string} table name
 */
function Model(table) {
  this.table = table;
  this.query = knex(this.table);
}

/**
 * @description creates and knex query builder for the table
 * @returns knex builder object
 */
Model.prototype.getQueryBuilder = function () {
  return knex(this.table);
};

// Generic Model Functions

module.exports = Model;
