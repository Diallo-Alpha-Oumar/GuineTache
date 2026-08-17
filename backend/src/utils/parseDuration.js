const UNITS = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

/**
 * Convertit une durée exprimée façon JWT (ex: "15m", "7d", "30s") en millisecondes.
 */
const parseDuration = (value) => {
  if (typeof value === 'number') return value;

  const match = /^(\d+)(ms|s|m|h|d)$/.exec(String(value).trim());
  if (!match) {
    throw new Error(`Format de durée invalide: ${value}`);
  }

  const [, amount, unit] = match;
  return parseInt(amount, 10) * UNITS[unit];
};

module.exports = parseDuration;
