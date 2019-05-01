const mongoose = require('mongoose');

require('dotenv').config();

const connectionString = process.env.DB_CONNECTION;

function connect() {
  mongoose
    .set('useNewUrlParser', true)
    .set('useFindAndModify', false)
    .connect(connectionString)
    .then(() => console.log('Connected to the database'))
    .catch((err) => {
      console.log('An error occured while trying to connect to the database.');
      console.log(`${err.name}: ${err.message}`);
    });
}

module.exports = connect;
