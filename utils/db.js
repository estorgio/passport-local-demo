const mongoose = require('mongoose');

const connectionString = process.env.DB_CONNECTION;

function connect() {
  const options = {
    useNewUrlParser: true,
    useFindAndModify: false,
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
