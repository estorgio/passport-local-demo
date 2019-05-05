const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  verified: { type: Boolean, default: false },
});

UserSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
});

module.exports = mongoose.model('User', UserSchema);
