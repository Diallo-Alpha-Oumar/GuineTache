const ApiError = require('../errors/ApiError');

const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route introuvable: ${req.originalUrl}`));
};

module.exports = notFound;
