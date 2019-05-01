const defineGlobalVars = (req, res, next) => {
  res.locals.pageTitle = '';
  res.locals.currentUser = '';
  res.locals.flashSuccess = [];
  res.locals.flashError = [];
  next();
};

module.exports = [defineGlobalVars];
