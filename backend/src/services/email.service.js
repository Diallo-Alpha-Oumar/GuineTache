const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../config/logger');

const isSmtpConfigured = () => Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD);

let transporter = null;

const getTransporter = () => {
  if (!isSmtpConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
    });
  }
  return transporter;
};

const buildOtpEmail = ({ otp, purpose }) => {
  const purposeLabels = {
    email_verification: 'vérifier votre adresse e-mail',
    password_reset: 'réinitialiser votre mot de passe',
  };
  const action = purposeLabels[purpose] || 'poursuivre votre opération';

  const subject = `${env.APP_NAME} - Votre code de vérification`;
  const text = `Voici votre code pour ${action} : ${otp}\nCe code est valable ${env.OTP_EXPIRES_IN_MINUTES} minutes.\nNe partagez jamais ce code avec qui que ce soit.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2>${env.APP_NAME}</h2>
      <p>Voici votre code pour ${action} :</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
      <p>Ce code est valable <strong>${env.OTP_EXPIRES_IN_MINUTES} minutes</strong>.</p>
      <p style="color: #b91c1c;">Ne partagez jamais ce code avec qui que ce soit.</p>
    </div>
  `;

  return { subject, text, html };
};

const sendOtpEmail = async ({ to, otp, purpose }) => {
  const { subject, text, html } = buildOtpEmail({ otp, purpose });
  const activeTransporter = getTransporter();

  if (!activeTransporter) {
    logger.warn(
      "SMTP non configuré (SMTP_HOST/SMTP_USER/SMTP_PASSWORD manquants) : l'e-mail OTP n'a pas été envoyé."
    );
    if (env.NODE_ENV !== 'production') {
      logger.info(`[DEV] Code OTP pour ${to} (${purpose}): ${otp}`);
    }
    return { sent: false };
  }

  await activeTransporter.sendMail({
    from: env.MAIL_FROM,
    to,
    subject,
    text,
    html,
  });

  return { sent: true };
};

module.exports = { sendOtpEmail, isSmtpConfigured };
