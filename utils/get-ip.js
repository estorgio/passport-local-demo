const production = (process.env.NODE_ENV
  && process.env.NODE_ENV.toLowerCase() === 'production')
  || false;

function extractClientIP(req, res, next) {
  req.clientIP = null;

  const { ip, ips } = req;

  if (ips.length <= 0) {
    req.clientIP = ip;
  } else {
    req.clientIP = ips.pop();
  }

  next();
}

function isTrustedProxy() {
  return production;
}

module.exports = { extractClientIP, isTrustedProxy };
