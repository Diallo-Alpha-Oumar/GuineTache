const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  codeHash: {
    type: String,
    required: true,
    select: false,
  },
  purpose: {
    type: String,
    enum: ['email_verification', 'password_reset'],
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  used: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Suppression automatique des documents expirés (TTL)
verificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
verificationSchema.index({ user: 1, purpose: 1 });

module.exports = mongoose.model('Verification', verificationSchema);
