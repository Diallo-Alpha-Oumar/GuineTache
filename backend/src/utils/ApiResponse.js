class ApiResponse {
  static success(res, { statusCode = 200, message = 'Opération effectuée avec succès', data = {} } = {}) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res, { statusCode = 500, message = 'Une erreur est survenue', errors = [] } = {}) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }
}

module.exports = ApiResponse;
