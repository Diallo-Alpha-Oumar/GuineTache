/**
 * Nettoie récursivement les entrées utilisateur (body, query, params) :
 * - supprime les clés d'opérateurs Mongo/NoSQL ($, .) pour prévenir les injections NoSQL
 * - échappe les balises HTML basiques pour limiter les risques XSS bruts
 * Ne remplace jamais la validation métier (voir src/validators) ni les requêtes paramétrées côté DB.
 */
const DANGEROUS_KEY_PATTERN = /^\$|\./;

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    return escapeHtml(value);
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === 'object') {
    return sanitizeObject(value);
  }
  return value;
};

const sanitizeObject = (obj) => {
  const clean = {};
  Object.keys(obj).forEach((key) => {
    if (DANGEROUS_KEY_PATTERN.test(key)) return;
    clean[key] = sanitizeValue(obj[key]);
  });
  return clean;
};

const sanitize = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    Object.keys(req.query).forEach((key) => {
      req.query[key] = sanitizeValue(req.query[key]);
    });
  }
  if (req.params && typeof req.params === 'object') {
    Object.keys(req.params).forEach((key) => {
      req.params[key] = sanitizeValue(req.params[key]);
    });
  }
  next();
};

module.exports = sanitize;
