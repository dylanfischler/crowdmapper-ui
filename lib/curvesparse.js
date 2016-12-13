"use strict";

module.exports = (csvBody) => {
  let dict = {};

  let rows = csvBody.split('\n');
  // remove header rows
  rows.splice(0,1);

  for(let row in rows) {
    let parts = rows[row].split(',');
    let lat = parts[1];
    let long = parts[2];
    let cluster = Math.round(parts[3]);

    if(!dict[cluster]) dict[cluster] = [];
    dict[cluster].push([lat, long]);
  }

  return dict;
}