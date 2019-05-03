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
  (req, res, next) => {
    const { username, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      req.flash('error', "Password doesn't match.");
      res.redirect('/signup');
      return;
    }

    User.register(new User({ username }), password, (err) => {
      if (err) {
        req.flash('error', err.message);
        res.redirect('/signup');
        return;
      }

      passport.authenticate('local')(req, res, (err2) => {
        if (err2) {
          next(err2);
          return;
        }
        req.flash('success', `Welcome to Passport Demo, ${req.user.username}!`);
        res.redirect('/dashboard');
      });
    });
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
