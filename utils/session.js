const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redisClient = require('./redis-client');

const sessionInstance = session({
  name: process.env.SESSION_NAME,
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 604800000 }, // 7 days
  resave: false,
  saveUninitialized: false,
  store: new RedisStore({
    prefix: process.env.SESSION_PREFIX,
    client: redisClient,
  }),
});

const checkIfSessionFailed = (req, res, next) => {
  if (!req.session) {
    next(new Error('An error occured while loading session'));
    return;
  }
  next();
};

module.exports = [sessionInstance, checkIfSessionFailed];
