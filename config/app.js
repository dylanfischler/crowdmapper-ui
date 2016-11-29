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
    var now = (new Date()).getTime();
    console.log(`${req.body.device_name} checking in at ${now}`);

    let body = req.body;
    let reqArgs = ["device_id", "device_type", "device_name", "last_lat", "last_long"];
    let values = [];

    reqArgs.forEach((arg) => {
      if(req.body[arg]) values.push(req.body[arg]);
    });

    if(values.length !== reqArgs.length) return res.sendStatus(400);
    else {  
      values.push(now);
      values.push(now);
      values.push(body.last_lat);
      values.push(body.last_long);

      let qry = "INSERT INTO devices (device_id, device_type, device_name, last_lat, last_long, last_seen) VALUES (?,?,?,?,?,?,?,?)\
                ON DUPLICATE KEY UPDATE last_seen=?, last_lat=?, last_long=?;"

      database.query(qry, values).then((resp) => {
        res.sendStatus(200);
      }).catch((err) => {
        console.error(err);
      })
    }
  });

  app.get('/monitor', (req, res) => {
    database.query("SELECT * FROM devices").then((rows) => {
      res.status(200).send(rows);
    }).catch((err) => {
      res.status(500).send(console.error(err))
    })
  });


  app.use('/', express.static('public'));
  return app;
}

module.exports = () => {
  let app = express();
  return configure(app);
};