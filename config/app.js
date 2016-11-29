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
    let body = req.body;
    let reqArgs = ["device_id", "device_type", "device_name"];
    let values = [];

    reqArgs.forEach((arg) => {
      if(req.body[arg]) values.push(req.body[arg]);
      else return res.sendStatus(400);
    });

    var now = (new Date()).getTime();
    values.push(now);
    values.push(now);

    let qry = "INSERT INTO devices (device_id, device_type, device_name, last_seen) VALUES (?,?,?,?)\
              ON DUPLICATE KEY UPDATE last_seen=?;"

    database.query(qry, values).then((resp) => {
      res.sendStatus(200);
    }).catch((err) => {
      console.error(err);
    })
  });


  app.use('/', express.static('public'));
  return app;
}

module.exports = () => {
  let app = express();
  return configure(app);
};