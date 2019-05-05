const mongoose = require('mongoose');

const VerificationTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  token: { type: String, trim: true },
  expires: { type: Date, default: Date.now },
});

module.exports = mongoose.model('VerificationToken', VerificationTokenSchema);
