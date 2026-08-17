const crypto = require('crypto');
const parseDuration = require('../utils/parseDuration');
const Session = require('../models/Session');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const ApiError = require('../errors/ApiError');
const env = require('../config/env');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * Génère un access token + refresh token, et persiste une session
 * (uniquement le hash du refresh token, jamais sa valeur brute).
 */
const issueTokens = async (user, { userAgent, ip } = {}) => {
  const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
  const refreshToken = signRefreshToken({
    sub: user._id.toString(),
    jti: crypto.randomUUID(),
  });

  const expiresAt = new Date(Date.now() + parseDuration(env.JWT_REFRESH_EXPIRES_IN));

  await Session.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    userAgent: userAgent || null,
    ip: ip || null,
    expiresAt,
  });

  return { accessToken, refreshToken };
};

/**
 * Vérifie un refresh token (signature + expiration + session non révoquée),
 * puis effectue une rotation : révoque l'ancienne session et en crée une nouvelle.
 */
const rotateRefreshToken = async (refreshToken) => {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw ApiError.unauthorized('Refresh token invalide ou expiré.');
  }

  const tokenHash = hashToken(refreshToken);
  const session = await Session.findOne({ tokenHash, user: payload.sub });

  if (!session || session.revokedAt || session.expiresAt.getTime() < Date.now()) {
    throw ApiError.unauthorized('Session invalide ou expirée.');
  }

  session.revokedAt = new Date();
  await session.save();

  return payload;
};

const revokeSessionByToken = async (refreshToken) => {
  if (!refreshToken) return;
  const tokenHash = hashToken(refreshToken);
  await Session.updateOne({ tokenHash, revokedAt: null }, { $set: { revokedAt: new Date() } });
};

const revokeAllUserSessions = async (userId) => {
  await Session.updateMany({ user: userId, revokedAt: null }, { $set: { revokedAt: new Date() } });
};

module.exports = {
  issueTokens,
  rotateRefreshToken,
  revokeSessionByToken,
  revokeAllUserSessions,
};
