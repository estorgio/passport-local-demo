const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth');

router.get('/',
  auth.isLoggedIn,
  (req, res) => {
    res.locals.pageTitle = 'Dashboard';
    res.render('dashboard/index');
  });

module.exports = router;
