const express = require('express');
const settingsController = require('../controllers/settings.controller');
const validate = require('../middlewares/validate');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');
const { updateSettingsSchema } = require('../validators/settings.validator');

const router = express.Router();

/**
 * @openapi
 * /settings/public:
 *   get:
 *     summary: Retourne les paramètres publics de l'application (inscriptions, maintenance)
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Paramètres publics
 */
router.get('/public', settingsController.getPublicSettings);

/**
 * @openapi
 * /settings:
 *   get:
 *     summary: Retourne l'ensemble des paramètres de l'application (réservé aux administrateurs)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Paramètres de l'application
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès réservé aux administrateurs
 */
router.get('/', authenticate, requireAdmin, settingsController.getSettings);

/**
 * @openapi
 * /settings:
 *   patch:
 *     summary: Met à jour les paramètres de l'application (réservé aux administrateurs)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               registrationOpen: { type: boolean }
 *               maintenanceMode: { type: boolean }
 *               maintenanceMessage: { type: string }
 *               notifications:
 *                 type: object
 *                 properties:
 *                   taskAssigned: { type: boolean }
 *                   taskUpdated: { type: boolean }
 *                   taskCompleted: { type: boolean }
 *                   taskOverdue: { type: boolean }
 *     responses:
 *       200:
 *         description: Paramètres mis à jour
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès réservé aux administrateurs
 */
router.patch('/', authenticate, requireAdmin, validate(updateSettingsSchema), settingsController.updateSettings);

module.exports = router;
