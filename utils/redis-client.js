const redis = require('redis');

const redisClient = redis.createClient({
  enable_offline_queue: false,
  url: process.env.REDISCLOUD_URL
    || process.env.REDIS_URL,
});

module.exports = redisClient;
