const env = require('./env');
const ApiError = require('../errors/ApiError');

const corsOptions = {
  origin(origin, callback) {
    // Autorise les requêtes sans origine (ex: outils, mobile, curl) et les origines whitelistées
    if (!origin || env.CORS_ORIGIN.length === 0 || env.CORS_ORIGIN.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new ApiError(403, "Origine non autorisée par la politique CORS"));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

module.exports = corsOptions;
