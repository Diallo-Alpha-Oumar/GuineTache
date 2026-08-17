/**
 * Enveloppe un contrôleur async pour transmettre automatiquement
 * les erreurs au middleware global de gestion d'erreurs.
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
