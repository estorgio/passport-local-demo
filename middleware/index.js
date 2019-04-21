const definePageTitle = (req, res, next) => {
  res.locals.pageTitle = '';
  next();
};

module.exports = [definePageTitle];
