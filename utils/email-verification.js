/* eslint-disable no-underscore-dangle */
const crypto = require('crypto');
const util = require('util');
const mailer = require('./mailer');

const VerificationToken = require('../models/verification-token');
const User = require('../models/user');

const randomBytes = util.promisify(crypto.randomBytes);
const pbkdf2 = util.promisify(crypto.pbkdf2);

const { ROOT_URL } = process.env;

async function generateToken(encoding) {
  let tokenValue = await randomBytes(32);
  let salt = await randomBytes(16);
  let derivedToken = await pbkdf2(tokenValue, salt, 25000, 512, 'sha256');

  if (encoding) {
    tokenValue = tokenValue.toString(encoding);
    salt = salt.toString(encoding);
    derivedToken = derivedToken.toString(encoding);
  }

  return { tokenValue, salt, derivedToken };
}

const verificationEmail = mailer.createTemplate(params => ({
  subject: 'Passport Demo Account Verification',
  html: `<p>Hi ${params.name},</p>
  <p>Thank you for signing up on Passport Demo.</p>
  <p>Please visit the link below to verify your account:</p>
  <p><a href="${params.link}">${params.link}</a></p>
  <p>This verification link will expire in 1 hour. You may generate another link by logging in to your account.</p>
  <p>Thank you,<br>Passport Demo Team`,
}));

async function hasValidToken(user) {
  const token = await VerificationToken.findOne({
    user: user._id,
    expires: { $gt: Date.now() },
  });
  return !!(token);
}

async function sendVerificationEmail(user) {
  if (await hasValidToken(user)) return;

  const token = await generateToken('base64');
  const tokenURL = encodeURIComponent(token.tokenValue);
  const saltURL = encodeURIComponent(token.salt);
  const verifyLink = `${ROOT_URL}verify/${tokenURL}/${saltURL}`;

  const newToken = new VerificationToken({
    user: user._id,
    token: token.derivedToken,
    salt: token.salt,
    expires: Date.now() + 3600000,
  });
  await newToken.save();

  await verificationEmail.sendTo(user.email, {
    name: user.fullName,
    link: verifyLink,
  });
}

async function verifyToken(tokenValue, salt) {
  const tokenBuffer = Buffer.from(tokenValue, 'base64');
  const saltBuffer = Buffer.from(salt, 'base64');

  const derivedToken = (await pbkdf2(tokenBuffer, saltBuffer, 25000, 512, 'sha256'))
    .toString('base64');

  const token = await VerificationToken.findOne({
    token: derivedToken,
    expires: { $gt: Date.now() },
  });

  if (token) {
    const user = await User.findById(token.user.toString());
    user.verified = true;
    await user.save();

    await token.deleteOne();
  }

  return !!(token);
}

module.exports = {
  sendVerificationEmail,
  verifyToken,
};
