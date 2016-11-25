"use strict";

let app = require('./config/app')();

const PORT = process.env.PORT || 8080;
app.listen(process.env.PORT || 8080, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = app;