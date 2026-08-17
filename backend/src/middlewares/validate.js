const ApiError = require('../errors/ApiError');

/**
 * Middleware générique de validation basé sur un schéma Zod.
 * Usage: validate(schema) où schema = { body?, query?, params? }
 */
const validate = (schema) => (req, res, next) => {
  const toValidate = ['body', 'query', 'params'].filter((key) => schema[key]);

  for (const key of toValidate) {
    const result = schema[key].safeParse(req[key]);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return next(ApiError.badRequest('Données invalides', errors));
    }
    req[key] = result.data;
  }

  return next();
};

module.exports = validate;
