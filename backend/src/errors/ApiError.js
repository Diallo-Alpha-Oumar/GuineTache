class ApiError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} message
   * @param {Array} errors
   * @param {boolean} isOperational - false pour les erreurs de programmation/internes
   */
  constructor(statusCode, message, errors = [], isOperational = true) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Requête invalide', errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Non authentifié', errors = []) {
    return new ApiError(401, message, errors);
  }

  static forbidden(message = 'Accès interdit', errors = []) {
    return new ApiError(403, message, errors);
  }

  static notFound(message = 'Ressource introuvable', errors = []) {
    return new ApiError(404, message, errors);
  }

  static conflict(message = 'Conflit de données', errors = []) {
    return new ApiError(409, message, errors);
  }

  static internal(message = 'Erreur interne du serveur', errors = []) {
    return new ApiError(500, message, errors, false);
  }
}

module.exports = ApiError;
