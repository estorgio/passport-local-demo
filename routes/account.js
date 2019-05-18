const express = require('express');
const csurf = require('csurf')();
const util = require('util');

const router = express.Router();

const auth = require('../middleware/auth');

router.get('/',
  auth.isLoggedIn,
  csurf,
  (req, res) => {
    const csrfToken = req.csrfToken();
    res.locals.pageTitle = 'Account Settings';
    res.render('account/index', { csrfToken });
  });

router.put('/',
  auth.isLoggedIn,
  csurf,
  async (req, res, next) => {
    try {
      const { fullName, email } = req.body;
      const {
        currentPassword,
        newPassword,
        confirmNewPassword,
      } = req.body;

      if (newPassword !== confirmNewPassword) {
        req.flash('error', 'Passwords do not match.');
        res.redirect('/account');
        return;
      }

      req.user.fullName = fullName;
      req.user.email = email;
      await req.user.save();

      const login = util.promisify(req.login).bind(req);
      await login(req.user);

      if (currentPassword.trim().length > 0) {
        await req.user.changePassword(currentPassword, newPassword);
      }

      req.flash('success', 'You account information has been updated');
      res.redirect('/account');
    } catch (err) {
      if (err.name === 'IncorrectPasswordError') {
        req.flash('error', 'Password is incorrect.');
        res.redirect('/account');
        return;
      }
      next(err);
    }
  });

module.exports = router;
