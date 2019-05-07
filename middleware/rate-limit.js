const { RateLimiterRedis } = require('rate-limiter-flexible');
const redisClient = require('../utils/redis-client');

const {
  LOGIN_ATTEMPTS_LIMIT,
  LOGIN_ATTEMPTS_DURATION,
} = process.env;

const limitLogin = new RateLimiterRedis({
  storeClient: redisClient,
  points: LOGIN_ATTEMPTS_LIMIT,
  duration: LOGIN_ATTEMPTS_DURATION,
  keyPrefix: 'limit-login',
});

async function preLoginCheck(req, res, next) {
  try {
    const attemptInfo = await limitLogin.get(req.clientIP);
    if (!attemptInfo || attemptInfo.remainingPoints > 0) {
      next();
      return;
    }
    req.flash('error', 'Max login attempts exceeded. Please try again later.');
    res.redirect('/login');
  } catch (err) {
    next(err);
  }
}

async function postLoginCheck(req, res, next) {
  try {
    if (!req.isAuthenticated || !req.user) {
      await limitLogin.consume(req.clientIP);
    }
    next();
  } catch (err) {
    req.flash('error', 'Max login attempts exceeded. Please try again later.');
    res.redirect('/login');
  }
}

module.exports = { preLoginCheck, postLoginCheck };
