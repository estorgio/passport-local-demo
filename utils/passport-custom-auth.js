const passport = require('passport');

function passportCustomAuth(strategy) {
  return (req, res, next) => {
    passport.authenticate(strategy, async (err, user) => {
      if (err) {
        next(err);
        return;
      }

      req.isAuthenticated = !!(user);

      if (user) {
        req.login(user, next);
      } else {
        next();
      }
    })(req, res, next);
  };
}

module.exports = passportCustomAuth;
