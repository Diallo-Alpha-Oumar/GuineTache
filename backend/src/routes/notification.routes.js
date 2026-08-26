const express = require('express');
const notificationController = require('../controllers/notification.controller');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth.middleware');
const enforceMaintenanceMode = require('../middlewares/maintenance.middleware');
const {
  notificationIdParamsSchema,
  listNotificationsSchema,
} = require('../validators/notification.validator');

const router = express.Router();

/**
 * @openapi
 * /notifications:
 *   get:
 *     summary: Liste les notifications de l'utilisateur authentifié
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des notifications
 *       401:
 *         description: Non authentifié
 */
router.get('/', authenticate,
  enforceMaintenanceMode, validate(listNotificationsSchema), notificationController.list);

/**
 * @openapi
 * /notifications/unread-count:
 *   get:
 *     summary: Nombre de notifications non lues de l'utilisateur authentifié
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nombre de notifications non lues
 *       401:
 *         description: Non authentifié
 */
router.get('/unread-count', authenticate,
  enforceMaintenanceMode, notificationController.unreadCount);

/**
 * @openapi
 * /notifications/read-all:
 *   patch:
 *     summary: Marque toutes les notifications de l'utilisateur comme lues
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications marquées comme lues
 *       401:
 *         description: Non authentifié
 */
router.patch('/read-all', authenticate,
  enforceMaintenanceMode, notificationController.markAllAsRead);

/**
 * @openapi
 * /notifications/{id}/read:
 *   patch:
 *     summary: Marque une notification comme lue
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification marquée comme lue
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Notification introuvable
 */
router.patch(
  '/:id/read',
  authenticate,
  enforceMaintenanceMode,
  validate(notificationIdParamsSchema),
  notificationController.markAsRead
);

/**
 * @openapi
 * /notifications/{id}:
 *   delete:
 *     summary: Supprime une notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification supprimée avec succès
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Notification introuvable
 */
router.delete('/:id', authenticate,
  enforceMaintenanceMode, validate(notificationIdParamsSchema), notificationController.remove);

module.exports = router;
