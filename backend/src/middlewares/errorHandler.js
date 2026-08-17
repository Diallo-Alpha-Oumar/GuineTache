const env = require('../config/env');
const logger = require('../config/logger');
const ApiError = require('../errors/ApiError');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Middleware global de gestion d'erreurs.
 * Doit être déclaré en dernier, après toutes les routes.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode && error.statusCode >= 400 ? error.statusCode : 500;
    error = new ApiError(statusCode, error.message || 'Erreur interne du serveur', [], false);
  }

  const isOperational = error.isOperational;

  if (!isOperational) {
    logger.error(err.stack || err.message);
  } else {
    logger.warn(`${error.statusCode} - ${error.message}`);
  }

  const message =
    !isOperational && env.NODE_ENV === 'production' ? 'Une erreur est survenue' : error.message;

  ApiResponse.error(res, {
    statusCode: error.statusCode,
    message,
    errors: error.errors,
  });
};

module.exports = errorHandler;
