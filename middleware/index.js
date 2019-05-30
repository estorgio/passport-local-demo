const defineGlobalVars = (req, res, next) => {
  res.locals.originalUrl = req.originalUrl;
  res.locals.currentUser = '';
  res.locals.flashSuccess = [];
  res.locals.flashError = [];
  next();
};

module.exports = [defineGlobalVars];
