const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth.middleware');
const { authLimiter } = require('../middlewares/rateLimiter');
const {
  registerSchema,
  verifyEmailSchema,
  resendOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} = require('../validators/auth.validator');

const router = express.Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *     responses:
 *       201:
 *         description: Compte créé, code de vérification envoyé par e-mail
 *       409:
 *         description: Adresse e-mail déjà utilisée
 */
router.post('/register', authLimiter, validate(registerSchema), authController.register);

/**
 * @openapi
 * /auth/verify-email:
 *   post:
 *     summary: Vérifie l'adresse e-mail à l'aide du code OTP reçu
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email: { type: string, format: email }
 *               otp: { type: string, example: "483921" }
 *     responses:
 *       200:
 *         description: Adresse e-mail vérifiée
 *       400:
 *         description: Code invalide ou expiré
 */
router.post('/verify-email', authLimiter, validate(verifyEmailSchema), authController.verifyEmail);

/**
 * @openapi
 * /auth/resend-otp:
 *   post:
 *     summary: Renvoie un nouveau code OTP de vérification d'e-mail
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Nouveau code envoyé
 *       429:
 *         description: Trop de demandes, veuillez patienter
 */
router.post('/resend-otp', authLimiter, validate(resendOtpSchema), authController.resendOtp);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *     responses:
 *       200:
 *         description: Connexion réussie, retourne l'access token (le refresh token est déposé en cookie httpOnly)
 *       401:
 *         description: Identifiants invalides
 */
router.post('/login', authLimiter, validate(loginSchema), authController.login);

/**
 * @openapi
 * /auth/refresh-token:
 *   post:
 *     summary: Génère un nouvel access token à partir du refresh token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Nouvel access token généré
 *       401:
 *         description: Refresh token invalide, expiré ou révoqué
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Déconnexion (révoque le refresh token courant)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 */
router.post('/logout', authController.logout);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Retourne l'utilisateur actuellement authentifié
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Utilisateur courant
 *       401:
 *         description: Non authentifié
 */
router.get('/me', authenticate, authController.getMe);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Demande de réinitialisation de mot de passe
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Réponse générique (ne révèle jamais si l'e-mail existe)
 */
router.post(
  '/forgot-password',
  authLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Réinitialise le mot de passe à l'aide du code OTP reçu
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp, newPassword]
 *             properties:
 *               email: { type: string, format: email }
 *               otp: { type: string, example: "483921" }
 *               newPassword: { type: string, format: password }
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé
 *       400:
 *         description: Code invalide ou expiré
 */
router.post(
  '/reset-password',
  authLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword
);

/**
 * @openapi
 * /auth/change-password:
 *   patch:
 *     summary: Change le mot de passe de l'utilisateur authentifié
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string, format: password }
 *               newPassword: { type: string, format: password }
 *     responses:
 *       200:
 *         description: Mot de passe modifié
 *       400:
 *         description: Mot de passe actuel incorrect
 */
router.patch(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
);

module.exports = router;
