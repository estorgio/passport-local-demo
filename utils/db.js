const mongoose = require('mongoose');
require('./volatile').setVolatileDB();

const connectionString = process.env.DB_CONNECTION;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function dbConnectionCheck(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return next(new Error('Unable to connect to the database'));
  }
  return next();
}

async function dbConnect() {
  let success = false;
  do {
    try {
      const options = {
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
        bufferCommands: false,
        bufferMaxEntries: 0,
        reconnectTries: Number.MAX_VALUE,
      };
      // eslint-disable-next-line no-await-in-loop
      await mongoose.connect(connectionString, options);
      console.log('Connected to the database');
      success = true;
    } catch (err) {
      success = false;
      console.log('An error occured while trying to connect to the database.');
      console.log(`${err.name}: ${err.message}`);
      // eslint-disable-next-line no-await-in-loop
      await sleep(5000);
    }
  } while (!success);
}

module.exports = { dbConnect, dbConnectionCheck };
