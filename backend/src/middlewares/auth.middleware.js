const User = require('../models/User');
const { verifyAccessToken } = require('../utils/jwt');
const ApiError = require('../errors/ApiError');
const catchAsync = require('../utils/catchAsync');

const extractToken = (req) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.slice('Bearer '.length).trim();
  }
  return null;
};

const authenticate = catchAsync(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    throw ApiError.unauthorized('Authentification requise.');
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (error) {
    throw ApiError.unauthorized('Token invalide ou expiré.');
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    throw ApiError.unauthorized("L'utilisateur associé à ce token n'existe plus.");
  }
  if (!user.isActive) {
    throw ApiError.forbidden('Ce compte a été désactivé.');
  }

  req.user = user;
  next();
});

module.exports = { authenticate };
