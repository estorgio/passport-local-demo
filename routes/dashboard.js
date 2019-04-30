const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.locals.pageTitle = 'Dashboard';
  res.render('dashboard/index');
});

module.exports = router;
