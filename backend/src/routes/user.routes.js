const express = require('express');
const userController = require('../controllers/user.controller');
const validate = require('../middlewares/validate');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');
const { listUsersSchema, userIdParamsSchema, updateUserSchema } = require('../validators/user.validator');

const router = express.Router();

router.use(authenticate, requireAdmin);

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Liste les utilisateurs (réservé aux administrateurs)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès réservé aux administrateurs
 */
router.get('/', validate(listUsersSchema), userController.list);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Récupère un utilisateur par id (réservé aux administrateurs)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *       404:
 *         description: Utilisateur introuvable
 */
router.get('/:id', validate(userIdParamsSchema), userController.getById);

/**
 * @openapi
 * /users/{id}:
 *   patch:
 *     summary: Met à jour un utilisateur, y compris son rôle (réservé aux administrateurs)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string, format: email }
 *               role: { type: string, enum: [user, admin] }
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 *       404:
 *         description: Utilisateur introuvable
 *       409:
 *         description: Adresse e-mail déjà utilisée
 */
router.patch('/:id', validate(updateUserSchema), userController.update);

/**
 * @openapi
 * /users/{id}/toggle-active:
 *   patch:
 *     summary: Active ou désactive un utilisateur (réservé aux administrateurs)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statut du compte modifié
 *       400:
 *         description: Impossible de modifier son propre statut
 *       404:
 *         description: Utilisateur introuvable
 */
router.patch('/:id/toggle-active', validate(userIdParamsSchema), userController.toggleActive);

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Supprime un utilisateur (réservé aux administrateurs)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 *       400:
 *         description: Impossible de supprimer son propre compte
 *       404:
 *         description: Utilisateur introuvable
 */
router.delete('/:id', validate(userIdParamsSchema), userController.remove);

module.exports = router;
