const crypto = require('crypto');
const Verification = require('../models/Verification');
const ApiError = require('../errors/ApiError');
const { hashPassword, comparePassword } = require('../utils/password');
const env = require('../config/env');

const generateOtp = () => String(crypto.randomInt(100000, 1000000));

/**
 * Crée un nouvel OTP pour un utilisateur/purpose donné, en invalidant les précédents.
 * Applique un délai minimum entre deux générations pour limiter les abus.
 */
const createOtp = async (userId, purpose) => {
  const lastActive = await Verification.findOne({ user: userId, purpose, used: false })
    .sort({ createdAt: -1 })
    .lean();

  if (lastActive) {
    const secondsSinceLast = (Date.now() - new Date(lastActive.createdAt).getTime()) / 1000;
    if (secondsSinceLast < env.OTP_RESEND_COOLDOWN_SECONDS) {
      const waitSeconds = Math.ceil(env.OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLast);
      throw new ApiError(429, `Veuillez patienter ${waitSeconds}s avant de redemander un code.`);
    }
  }

  // Invalide tous les OTP actifs précédents pour ce couple utilisateur/purpose.
  await Verification.updateMany(
    { user: userId, purpose, used: false },
    { $set: { used: true } }
  );

  const otp = generateOtp();
  const codeHash = await hashPassword(otp);
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRES_IN_MINUTES * 60 * 1000);

  await Verification.create({ user: userId, purpose, codeHash, expiresAt });

  return otp;
};

/**
 * Vérifie un OTP fourni par l'utilisateur. Lève une ApiError en cas d'échec.
 */
const verifyOtp = async (userId, purpose, code) => {
  const verification = await Verification.findOne({ user: userId, purpose, used: false })
    .sort({ createdAt: -1 })
    .select('+codeHash');

  if (!verification) {
    throw ApiError.badRequest('Code de vérification invalide ou expiré.');
  }

  if (verification.expiresAt.getTime() < Date.now()) {
    verification.used = true;
    await verification.save();
    throw ApiError.badRequest('Code de vérification invalide ou expiré.');
  }

  if (verification.attempts >= env.OTP_MAX_ATTEMPTS) {
    verification.used = true;
    await verification.save();
    throw ApiError.badRequest('Nombre maximal de tentatives atteint. Demandez un nouveau code.');
  }

  const isValid = await comparePassword(code, verification.codeHash);

  if (!isValid) {
    verification.attempts += 1;
    await verification.save();
    throw ApiError.badRequest('Code de vérification invalide ou expiré.');
  }

  verification.used = true;
  await verification.save();
};

module.exports = { createOtp, verifyOtp };
