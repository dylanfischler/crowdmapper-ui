"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const config = require('../config.json');
const Database = require('../lib/database');

const configure = (app) => {
  let database = new Database(config);

  app.set('view engine', 'ejs');
  app.use(bodyParser.json());

  app.get('/api/location', (req, res) => {
    database.query("SELECT * FROM locations").then((rows) => {
      res.send(rows);
    }).catch((err) => {
      console.error(err);
    })
  });

  app.post('/monitor/poll', (req, res) => {
    console.log(req.body);
  });


  app.use('/', express.static('public'));
  return app;
}

module.exports = () => {
  let app = express();
  return configure(app);
};