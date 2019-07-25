/* eslint-disable no-underscore-dangle */
const crypto = require('crypto');
const util = require('util');
const mailer = require('./mailer');
const redisClient = require('./redis-client');

const User = require('../models/user');

const randomBytes = util.promisify(crypto.randomBytes);
const pbkdf2 = util.promisify(crypto.pbkdf2);

const redisGet = util.promisify(redisClient.get).bind(redisClient);
const redisSetEx = util.promisify(redisClient.setex).bind(redisClient);
const redisDel = util.promisify(redisClient.del).bind(redisClient);

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
  <p>This verification link will expire in 10 minutes. You may generate another link by logging in to your account.</p>
  <p>Thank you,<br>Passport Demo Team`,
}));

async function hasValidToken(user) {
  const token = await redisGet(`email-verification:${user._id}`);
  return !!token;
}

async function sendVerificationEmail(user) {
  if (await hasValidToken(user)) return;

  const token = await generateToken('base64');
  const tokenURL = encodeURIComponent(token.tokenValue);
  const saltURL = encodeURIComponent(token.salt);
  const verifyLink = `${ROOT_URL}verify/${tokenURL}/${saltURL}`;

  await redisSetEx(
    `email-verification:${user._id}`,
    600,
    JSON.stringify({
      token: token.derivedToken,
      salt: token.salt,
    }),
  );

  await redisSetEx(
    `verification-token:${token.derivedToken}`,
    600,
    JSON.stringify({
      user: user._id,
    }),
  );

  await verificationEmail.sendTo(user.email, {
    name: user.fullName,
    link: verifyLink,
  });
}

async function verifyToken(tokenValue, salt) {
  const tokenBuffer = Buffer.from(tokenValue, 'base64');
  const saltBuffer = Buffer.from(salt, 'base64');

  const derivedToken = (await pbkdf2(
    tokenBuffer,
    saltBuffer,
    25000,
    512,
    'sha256',
  )).toString('base64');

  const redisKeyName = `verification-token:${derivedToken}`;
  let token = await redisGet(redisKeyName);

  if (token) {
    token = JSON.parse(token);

    const user = await User.findById(token.user);
    user.verified = true;
    await user.save();

    await redisDel(redisKeyName);
    await redisDel(`email-verification:${user._id}`);
  }

  return !!token;
}

module.exports = {
  sendVerificationEmail,
  verifyToken,
};
