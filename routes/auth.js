const express = require('express');

const router = express.Router();

const passport = require('passport');
const User = require('../models/user');
const auth = require('../middleware/auth');

router.get('/login',
  auth.isLoggedOut,
  (req, res) => {
    res.locals.pageTitle = 'Log In';
    res.render('auth/login');
  });

router.post('/login',
  auth.isLoggedOut,
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
  (req, res) => {
    res.locals.pageTitle = 'Sign Up';
    res.render('auth/signup');
  });

router.post('/signup',
  auth.isLoggedOut,
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

module.exports = router;
