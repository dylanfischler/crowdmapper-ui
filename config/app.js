"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const config = require('../config.json');
const Database = require('../lib/database');
const fs = require('fs');
const AWS = require('aws-sdk'); 
const path = require('path');

const CLUSTER_FILE_PATH='../data/clusters';

const configure = (app) => {
  let database = new Database(config);
  let s3 = new AWS.S3();

  app.set('view engine', 'ejs');
  app.use(bodyParser.json());

  app.get('/api/location', (req, res) => {
    database.query("SELECT * FROM locations").then((rows) => {
      res.send(rows);
    }).catch((err) => {
      console.error(err);
    })
  });

  app.get('/api/clusters', (req, res) => {
    var params = { Bucket: 'crowdmapper', Key: 'clusters' };
    s3.getObject(params, (err, data) => {
      if(err) {
        console.error('S3 Error');
        console.log("Falling back to local historical copy");
        fs.readFile(path.resolve(__dirname, CLUSTER_FILE_PATH), (err, contents) => {
          if(err) return res.status(500).send(err);
          else return res.send(contents);
        });
      }
      else {
        res.send(data.Body.toString());
      }
    });

    
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

      let qry = "INSERT INTO devices (device_id, device_type, device_name, last_lat, last_long, last_seen) VALUES (?,?,?,?,?,?)\
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