const passport = require('passport');
const rateLimiter = require('../utils/rate-limiter');

const limitLoginAttempts = rateLimiter({
  points: process.env.LOGIN_ATTEMPTS_LIMIT,
  duration: process.env.LOGIN_ATTEMPTS_DURATION,
  keyPrefix: 'limit-login',
});

const limitVerifyAttempts = rateLimiter({
  points: process.env.VERIFY_ATTEMPTS_LIMIT,
  duration: process.env.VERIFY_ATTEMPTS_DURATION,
  keyPrefix: 'limit-verify',
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.flash('error', 'You must be signed in to perform this action.');
  return res.redirect('/login');
}

function isLoggedOut(req, res, next) {
  if (!req.isAuthenticated()) return next();
  return res.redirect('/');
}

function passportCustomAuth(strategy) {
  return [
    limitLoginAttempts,
    async (req, res, next) => {
      const { rateLimit } = req;

      if (await rateLimit.hasExceeded()) {
        req.flash('error', 'Max login attempts exceeded. Please try again later.');
        res.redirect('/login');
        return;
      }

      passport.authenticate(strategy, async (err, user) => {
        if (err) {
          next(err);
          return;
        }

        req.isAuthenticated = !!(user);

        if (user) {
          req.login(user, next);
        } else {
          await rateLimit.incrementCounter();
          next();
        }
      })(req, res, next);
    },
  ];
}

module.exports = {
  isLoggedIn,
  isLoggedOut,
  passportCustomAuth,
  limitVerifyAttempts,
};
