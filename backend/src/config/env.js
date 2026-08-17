const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const toArray = (value) =>
  (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  API_PREFIX: process.env.API_PREFIX || '/api/v1',

  CORS_ORIGIN: toArray(process.env.CORS_ORIGIN),

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  COOKIE_SECRET: process.env.COOKIE_SECRET,

  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  RATE_LIMIT_MAX:
    process.env.NODE_ENV === 'test' ? 100000 : parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  AUTH_RATE_LIMIT_WINDOW_MS:
    parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  AUTH_RATE_LIMIT_MAX:
    process.env.NODE_ENV === 'test' ? 100000 : parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 10,

  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,

  DATABASE_URL: process.env.DATABASE_URL || null,
  MONGODB_URI: process.env.MONGODB_URI || null,

  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  APP_NAME: process.env.APP_NAME || 'GuineTache',

  SMTP_HOST: process.env.SMTP_HOST || null,
  SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
  SMTP_USER: process.env.SMTP_USER || null,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || null,
  MAIL_FROM: process.env.MAIL_FROM || 'no-reply@guinetache.local',

  OTP_EXPIRES_IN_MINUTES: parseInt(process.env.OTP_EXPIRES_IN_MINUTES, 10) || 10,
  OTP_MAX_ATTEMPTS: parseInt(process.env.OTP_MAX_ATTEMPTS, 10) || 5,
  OTP_RESEND_COOLDOWN_SECONDS: parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS, 10) || 60,
};

const isProduction = env.NODE_ENV === 'production';

if (isProduction) {
  const required = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'COOKIE_SECRET', 'MONGODB_URI'];
  const missing = required.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Variables d'environnement manquantes en production: ${missing.join(', ')}`
    );
  }
}

module.exports = env;
