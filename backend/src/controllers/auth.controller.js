const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const httpStatus = require('../constants/httpStatus');
const authService = require('../services/auth.service');
const parseDuration = require('../utils/parseDuration');
const env = require('../config/env');

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_PATH = `${env.API_PREFIX}/auth`;

const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  signed: true,
  path: REFRESH_COOKIE_PATH,
  maxAge: parseDuration(env.JWT_REFRESH_EXPIRES_IN),
});

const setRefreshCookie = (res, refreshToken) => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
};

const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
};

const getRefreshTokenFromRequest = (req) =>
  (req.signedCookies && req.signedCookies[REFRESH_COOKIE_NAME]) || req.body?.refreshToken || null;

const getRequestMeta = (req) => ({
  userAgent: req.headers['user-agent'],
  ip: req.ip,
});

const register = catchAsync(async (req, res) => {
  await authService.register(req.body);
  ApiResponse.success(res, {
    statusCode: httpStatus.CREATED,
    message: 'Compte créé. Un code de vérification a été envoyé à votre adresse e-mail.',
  });
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.body);
  ApiResponse.success(res, {
    message: 'Adresse e-mail vérifiée avec succès.',
  });
});

const resendOtp = catchAsync(async (req, res) => {
  await authService.resendOtp(req.body);
  ApiResponse.success(res, {
    message: 'Un nouveau code de vérification a été envoyé.',
  });
});

const login = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body, getRequestMeta(req));
  setRefreshCookie(res, refreshToken);
  ApiResponse.success(res, {
    message: 'Connexion réussie.',
    data: { user, accessToken },
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const rawRefreshToken = getRefreshTokenFromRequest(req);
  const { accessToken, refreshToken: newRefreshToken } = await authService.refresh(
    rawRefreshToken,
    getRequestMeta(req)
  );
  setRefreshCookie(res, newRefreshToken);
  ApiResponse.success(res, {
    message: 'Token rafraîchi avec succès.',
    data: { accessToken },
  });
});

const logout = catchAsync(async (req, res) => {
  const rawRefreshToken = getRefreshTokenFromRequest(req);
  await authService.logout(rawRefreshToken);
  clearRefreshCookie(res);
  ApiResponse.success(res, { message: 'Déconnexion réussie.' });
});

const getMe = catchAsync(async (req, res) => {
  ApiResponse.success(res, {
    data: authService.toPublicUser(req.user),
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  await authService.forgotPassword(req.body);
  ApiResponse.success(res, {
    message:
      'Si cette adresse correspond à un compte, les instructions de réinitialisation ont été envoyées.',
  });
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.body);
  ApiResponse.success(res, { message: 'Mot de passe réinitialisé avec succès.' });
});

const changePassword = catchAsync(async (req, res) => {
  await authService.changePassword(req.user._id, req.body);
  ApiResponse.success(res, { message: 'Mot de passe modifié avec succès.' });
});

const updateProfile = catchAsync(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);
  ApiResponse.success(res, {
    message: 'Profil mis à jour avec succès.',
    data: user,
  });
});

const uploadAvatar = catchAsync(async (req, res) => {
  const user = await authService.updateAvatar(req.user._id, req.file);
  ApiResponse.success(res, {
    message: 'Photo de profil mise à jour avec succès.',
    data: user,
  });
});

const deleteAvatar = catchAsync(async (req, res) => {
  const user = await authService.removeAvatar(req.user._id);
  ApiResponse.success(res, {
    message: 'Photo de profil supprimée avec succès.',
    data: user,
  });
});

module.exports = {
  register,
  verifyEmail,
  resendOtp,
  login,
  refreshToken,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
};
