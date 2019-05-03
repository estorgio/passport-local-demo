const axios = require('axios');

const siteKey = process.env.RECAPTCHA_SITE_KEY;
const secretKey = process.env.RECAPTCHA_SECRET_KEY;

function getSiteKey() {
  return siteKey;
}

function getSecretKey() {
  return secretKey;
}

async function verifyToken(token) {
  let recaptchaUrl = 'https://www.google.com/recaptcha/api/siteverify?';
  recaptchaUrl += `secret=${secretKey}&`;
  recaptchaUrl += `response=${token}`;

  const response = await axios.post(recaptchaUrl, {});

  return response.data.success;
}

function validate() {
  return async (req, res, next) => {
    const token = req.body['g-recaptcha-response'];
    const isTokenValid = await verifyToken(token);

    if (isTokenValid) {
      next();
    } else {
      const err = new Error('reCAPTCHA validation failed. Please try again.');
      err.code = 'ERECAPTCHAFAIL';
      next(err);
    }
  };
}

module.exports = {
  getSiteKey,
  getSecretKey,
  verifyToken,
  validate,
};
