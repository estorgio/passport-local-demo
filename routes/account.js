const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth');

router.get('/',
  auth.isLoggedIn,
  (req, res) => {
    res.render('account/index');
  });

module.exports = router;
