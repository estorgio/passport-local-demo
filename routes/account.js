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

      req.user.fullName = fullName;
      req.user.email = email;
      await req.user.save();

      const login = util.promisify(req.login).bind(req);
      await login(req.user);

      req.flash('success', 'You account information has been updated');
      res.redirect('/account');
    } catch (err) {
      next(err);
    }
  });

module.exports = router;
