const User = require('../models/User');
const ApiError = require('../errors/ApiError');
const otpService = require('./otp.service');
const tokenService = require('./token.service');
const emailService = require('./email.service');

const PUBLIC_USER_FIELDS = [
  '_id',
  'firstName',
  'lastName',
  'email',
  'role',
  'isEmailVerified',
  'isActive',
  'createdAt',
  'updatedAt',
];

const toPublicUser = (user) => {
  const publicUser = {};
  PUBLIC_USER_FIELDS.forEach((field) => {
    publicUser[field === '_id' ? 'id' : field] = user[field];
  });
  return publicUser;
};

const register = async ({ firstName, lastName, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict('Cette adresse e-mail est déjà utilisée.');
  }

  // Le rôle est toujours forcé à 'user' : jamais accepté depuis l'entrée client.
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role: 'user',
    isEmailVerified: false,
  });

  const otp = await otpService.createOtp(user._id, 'email_verification');
  await emailService.sendOtpEmail({ to: user.email, otp, purpose: 'email_verification' });
};

const verifyEmail = async ({ email, otp }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw ApiError.badRequest('Code de vérification invalide ou expiré.');
  }
  if (user.isEmailVerified) {
    throw ApiError.badRequest('Cette adresse e-mail est déjà vérifiée.');
  }

  await otpService.verifyOtp(user._id, 'email_verification', otp);

  user.isEmailVerified = true;
  await user.save();
};

const resendOtp = async ({ email }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw ApiError.notFound('Aucun compte associé à cette adresse e-mail.');
  }
  if (user.isEmailVerified) {
    throw ApiError.badRequest('Cette adresse e-mail est déjà vérifiée.');
  }

  const otp = await otpService.createOtp(user._id, 'email_verification');
  await emailService.sendOtpEmail({ to: user.email, otp, purpose: 'email_verification' });
};

const login = async ({ email, password }, meta) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Identifiants invalides.');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Ce compte a été désactivé.');
  }

  if (!user.isEmailVerified) {
    throw ApiError.forbidden('Veuillez vérifier votre adresse e-mail avant de vous connecter.');
  }

  user.lastLogin = new Date();
  await user.save();

  const { accessToken, refreshToken } = await tokenService.issueTokens(user, meta);

  return { user: toPublicUser(user), accessToken, refreshToken };
};

const refresh = async (rawRefreshToken, meta) => {
  if (!rawRefreshToken) {
    throw ApiError.unauthorized('Refresh token manquant.');
  }

  const payload = await tokenService.rotateRefreshToken(rawRefreshToken);

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Utilisateur introuvable ou inactif.');
  }

  const { accessToken, refreshToken } = await tokenService.issueTokens(user, meta);

  return { accessToken, refreshToken };
};

const logout = async (rawRefreshToken) => {
  await tokenService.revokeSessionByToken(rawRefreshToken);
};

const forgotPassword = async ({ email }) => {
  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    return;
  }

  const otp = await otpService.createOtp(user._id, 'password_reset');
  await emailService.sendOtpEmail({ to: user.email, otp, purpose: 'password_reset' });
};

const resetPassword = async ({ email, otp, newPassword }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw ApiError.badRequest('Code de réinitialisation invalide ou expiré.');
  }

  await otpService.verifyOtp(user._id, 'password_reset', otp);

  user.password = newPassword;
  await user.save();

  await tokenService.revokeAllUserSessions(user._id);
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw ApiError.badRequest('Mot de passe actuel incorrect.');
  }

  user.password = newPassword;
  await user.save();

  await tokenService.revokeAllUserSessions(user._id);
};

module.exports = {
  toPublicUser,
  register,
  verifyEmail,
  resendOtp,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
};
