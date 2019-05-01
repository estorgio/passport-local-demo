const passport = require('passport');
const LocalStrategy = require('passport-local');

const User = require('../models/user');

const passportInit = passport.initialize();
const passportSession = passport.session();

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

function saveToLocals(req, res, next) {
  res.locals.currentUser = req.user;
  next();
}

module.exports = [passportInit, passportSession, saveToLocals];
