const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const volatile = require('../utils/volatile');

const UserSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  verified: { type: Boolean, default: false },
  avatar: String,
});

UserSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
});

UserSchema.plugin(volatile.mongoosePlugin);

module.exports = mongoose.model('User', UserSchema);
