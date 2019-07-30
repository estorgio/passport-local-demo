const express = require('express');
const csurf = require('csurf')();
const util = require('util');
const auth = require('../middleware/auth');
const imageUpload = require('../utils/image-upload');

const router = express.Router();

router.get('/', auth.isLoggedIn, csurf, (req, res) => {
  const csrfToken = req.csrfToken();
  res.render('account/index', { csrfToken });
});

router.put(
  '/',
  auth.isLoggedIn,
  imageUpload.single('avatar'),
  csurf,
  async (req, res, next) => {
    try {
      const { fullName, email } = req.body;
      const { currentPassword, newPassword, confirmNewPassword } = req.body;

      if (newPassword !== confirmNewPassword) {
        req.flash('error', 'Passwords do not match.');
        res.redirect('/account');
        return;
      }

      const upload = await req.startUpload();
      if (upload && upload.secure_url) {
        req.user.avatar = upload.secure_url;
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
  },
);

// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
  const catchErrors = ['MulterError', 'MissingPasswordError'];
  if (catchErrors.some(name => name === err.name)) {
    req.flash('error', err.message);
    res.redirect('back');
    return;
  }
  next(err);
});

module.exports = router;
