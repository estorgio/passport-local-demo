
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.flash('error', 'You must be signed in to perform this action.');
  return res.redirect('/login');
}

function isLoggedOut(req, res, next) {
  if (!req.isAuthenticated()) return next();
  return res.redirect('/');
}

module.exports = {
  isLoggedIn,
  isLoggedOut,
};
