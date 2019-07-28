const volatileMode = process.env.VOLATILE_MODE
  ? process.env.VOLATILE_MODE.trim().toLowerCase() !== 'false'
  : true;

function isVolatile() {
  return volatileMode;
}

module.exports = { isVolatile };
