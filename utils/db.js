const mongoose = require('mongoose');
const { isVolatile } = require('./volatile');

const connectionString = isVolatile()
  ? process.env.DB_CONNECTION_VOLATILE
  : process.env.DB_CONNECTION;

function connect() {
  const options = {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    bufferCommands: false,
    bufferMaxEntries: 0,
    reconnectTries: Number.MAX_VALUE,
  };
  mongoose
    .connect(connectionString, options)
    .then(() => console.log('Connected to the database'))
    .catch((err) => {
      console.log('An error occured while trying to connect to the database.');
      console.log(`${err.name}: ${err.message}`);
      process.exit(1);
    });
}

module.exports = connect;
