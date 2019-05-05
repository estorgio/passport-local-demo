const express = require('express');

const router = express.Router();

const passport = require('passport');
const csurf = require('csurf')();
const User = require('../models/user');
const auth = require('../middleware/auth');
const recaptcha = require('../utils/recaptcha');

router.get('/login',
  auth.isLoggedOut,
  csurf,
  (req, res) => {
    const csrfToken = req.csrfToken();

    res.locals.pageTitle = 'Log In';
    res.render('auth/login', { csrfToken });
  });

router.post('/login',
  auth.isLoggedOut,
  csurf,
  passport.authenticate('local', {
    successFlash: 'You have successfully logged in.',
    successRedirect: '/dashboard',
    failureFlash: 'Invalid username or password!',
    failureRedirect: '/login',
  }));

router.get('/logout',
  auth.isLoggedIn,
  (req, res) => {
    req.logout();
    req.flash('success', 'You have now logged out.');
    res.redirect('/login');
  });

router.get('/signup',
  auth.isLoggedOut,
  csurf,
  (req, res) => {
    const csrfToken = req.csrfToken();
    const recaptchaSiteKey = recaptcha.getSiteKey();

    res.locals.pageTitle = 'Sign Up';
    res.render('auth/signup', { csrfToken, recaptchaSiteKey });
  });

router.post('/signup',
  auth.isLoggedOut,
  csurf,
  recaptcha.validate(),
  async (req, res, next) => {
    try {
      const { password, confirmPassword } = req.body;
      const { fullName, email } = req.body;

      if (password !== confirmPassword) {
        throw new Error("Password doesn't match");
      }

      const newUser = new User({ fullName, email });
      await User.register(newUser, password);

      next();
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/signup');
    }
  },
  passport.authenticate('local'),
  (req, res) => {
    req.flash('success', `Welcome to Passport Demo, ${req.user.fullName}!`);
    res.redirect('/dashboard');
  });

router.use((err, req, res, next) => {
  if (err.code === 'ERECAPTCHAFAIL') {
    req.flash('error', err.message);
    res.redirect('back');
    return;
  }
  next(err);
});

module.exports = router;
