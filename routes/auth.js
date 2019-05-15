const express = require('express');

const router = express.Router();

const csurf = require('csurf')();
const User = require('../models/user');
const auth = require('../middleware/auth');
const recaptcha = require('../utils/recaptcha');
const emailVerification = require('../utils/email-verification');

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
  auth.passportCustomAuth('local'),
  async (req, res, next) => {
    if (!req.isAuthenticated || req.user.verified) {
      next();
      return;
    }
    await emailVerification.sendVerificationEmail(req.user);
    req.logout();
    req.flash('success', 'Your account is almost done. To complete the sign up, please open the verification link sent to you via email');
    res.redirect('/login');
  },
  async (req, res) => {
    if (req.isAuthenticated) {
      req.flash('success', 'You have successfully logged in.');
      res.redirect('/dashboard');
    } else {
      req.flash('error', 'Invalid username or password!');
      res.redirect('/login');
    }
  });

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
  async (req, res) => {
    try {
      const { password, confirmPassword } = req.body;
      const { fullName, email } = req.body;

      if (password !== confirmPassword) {
        throw new Error("Password doesn't match");
      }

      const newUser = new User({ fullName, email });
      await User.register(newUser, password);

      await emailVerification.sendVerificationEmail(newUser);

      req.flash('success', 'Your account is almost finished. Please check your email for the verification link.');
      res.redirect('/login');
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/signup');
    }
  });

router.get('/verify/:token/:salt', async (req, res, next) => {
  try {
    const { token, salt } = req.params;
    if (await emailVerification.verifyToken(token, salt)) {
      req.flash('success', 'Your account has been verified. You can now login to your account.');
    } else {
      req.flash('error', 'Account verification failed. The link may have expired or is no longer valid.');
    }
    res.redirect('/login');
  } catch (err) {
    next(err);
  }
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
