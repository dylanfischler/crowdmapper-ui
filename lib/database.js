"use strict";

const mysql = require('mysql');

function Database(config) {
  this.pool = mysql.createPool({
    host: config.DB_HOST,
    user: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    database: config.DB_NAME
  });
}

Database.prototype.query = function query(...args) {
  return new Promise((resolve, reject) => {
    this.pool.getConnection((err, conn) => {
      if(err) reject(err);
      else {
        conn.query(...args, function(err, rows) {
          conn.release();

          if(err) reject(err);
          resolve(rows);
        });
      }
    });
  });
}

Database.prototype.end = () => {
  return new Promise((resolve, reject) => {
    this.pool.end((err) => {
      if(err) reject(err);
      else resolve();
    });
  });
}

module.exports = Database;