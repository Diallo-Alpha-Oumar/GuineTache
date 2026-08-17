const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  // Hash SHA-256 du refresh token JWT : la valeur brute n'est jamais persistée.
  tokenHash: {
    type: String,
    required: true,
    unique: true,
  },
  userAgent: {
    type: String,
    default: null,
  },
  ip: {
    type: String,
    default: null,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  revokedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Suppression automatique des sessions expirées (TTL)
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Session', sessionSchema);
