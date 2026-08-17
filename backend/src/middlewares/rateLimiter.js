const rateLimit = require('express-rate-limit');
const env = require('../config/env');
const ApiResponse = require('../utils/ApiResponse');

const handler = (req, res) => {
  ApiResponse.error(res, {
    statusCode: 429,
    message: 'Trop de requêtes, veuillez réessayer plus tard',
  });
};

const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

// Limiteur renforcé pour les routes sensibles (ex: /auth/login)
const authLimiter = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler,
});

module.exports = { globalLimiter, authLimiter };
