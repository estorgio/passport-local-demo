const volatileMode = process.env.VOLATILE_MODE
  ? process.env.VOLATILE_MODE.trim().toLowerCase() !== 'false'
  : true;

function isVolatile() {
  return volatileMode;
}

function beforeSave(next) {
  this.volatile = volatileMode;
  next();
}

function mongoosePlugin(schema) {
  schema.add({ volatile: Boolean });
  schema.pre('save', beforeSave);
}

module.exports = { isVolatile, mongoosePlugin };
