const mongoose = require('mongoose');

const volatileMode = process.env.VOLATILE_MODE
  ? process.env.VOLATILE_MODE.trim().toLowerCase() !== 'false'
  : true;

function isVolatile() {
  return volatileMode;
}

function setVolatileDB() {
  if (!volatileMode) return;
  const oldPluralizer = mongoose.pluralize();
  const volatilePostfixer = (name) => {
    const oldName = oldPluralizer(name);
    return `${oldName}_volatile`;
  };
  mongoose.pluralize(volatilePostfixer);
}

module.exports = { isVolatile, setVolatileDB };
