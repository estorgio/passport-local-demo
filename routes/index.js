const express = require('express');

const router = express.Router();

const production = process.env.NODE_ENV
  ? process.env.NODE_ENV.toLowerCase() === 'production'
  : false;

router.get('/', (req, res) => {
  res.locals.pageTitle = 'Landing Page';
  res.render('index');
});

// Error handler trigger route
router.get('/error', (req, res, next) => {
  next(Error('Some error occured'));
});

// 404 page for undefined routes
router.all('*', (req, res) => {
  res.locals.pageTitle = 'Page Not Found';
  res.status(404);
  res.render('404');
});

// Global error handler route
// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
  const errorInfo = !production ? err : null;
  res.locals.pageTitle = 'Internal Server Error';
  res.status(500);
  res.render('error', { errorInfo });
});

module.exports = router;
