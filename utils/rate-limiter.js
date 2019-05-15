const { RateLimiterRedis } = require('rate-limiter-flexible');
const redisClient = require('../utils/redis-client');

function hasExceeded(limiter, req) {
  return async () => {
    const attemptInfo = await limiter.get(req.clientIP);
    return attemptInfo && attemptInfo.remainingPoints <= 0;
  };
}

function incrementCounter(limiter, req) {
  return async () => limiter.consume(req.clientIP);
}

function rateLimiter(options) {
  const limiter = new RateLimiterRedis({
    storeClient: redisClient,
    ...options,
  });

  return (req, res, next) => {
    req.rateLimit = {
      hasExceeded: hasExceeded(limiter, req),
      incrementCounter: incrementCounter(limiter, req),
    };
    next();
  };
}

module.exports = rateLimiter;
