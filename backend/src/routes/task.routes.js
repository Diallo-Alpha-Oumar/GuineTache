const express = require('express');
const taskController = require('../controllers/task.controller');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth.middleware');
const {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamsSchema,
  listTasksSchema,
} = require('../validators/task.validator');

const router = express.Router();

/**
 * @openapi
 * /tasks:
 *   post:
 *     summary: Crée une nouvelle tâche
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string, example: "Rédiger le rapport mensuel" }
 *               description: { type: string }
 *               priority: { type: string, enum: [low, medium, high, urgent] }
 *               dueDate: { type: string, format: date-time }
 *               assignedTo: { type: string, description: "ID de l'utilisateur assigné" }
 *     responses:
 *       201:
 *         description: Tâche créée
 *       400:
 *         description: Données invalides ou utilisateur assigné introuvable
 *       401:
 *         description: Non authentifié
 */
router.post('/', authenticate, validate(createTaskSchema), taskController.create);

/**
 * @openapi
 * /tasks:
 *   get:
 *     summary: Liste les tâches (non supprimées) accessibles à l'utilisateur
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des tâches
 *       401:
 *         description: Non authentifié
 */
router.get('/', authenticate, validate(listTasksSchema), taskController.list);

/**
 * @openapi
 * /tasks/stats:
 *   get:
 *     summary: Statistiques des tâches accessibles à l'utilisateur
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques
 *       401:
 *         description: Non authentifié
 */
router.get('/stats', authenticate, taskController.stats);

/**
 * @openapi
 * /tasks/{id}:
 *   get:
 *     summary: Récupère une tâche par id (non supprimée)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tâche trouvée
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès interdit
 *       404:
 *         description: Tâche introuvable
 */
router.get('/:id', authenticate, validate(taskIdParamsSchema), taskController.getById);

/**
 * @openapi
 * /tasks/{id}:
 *   patch:
 *     summary: Met à jour une tâche
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tâche mise à jour
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès interdit
 *       404:
 *         description: Tâche introuvable
 */
router.patch('/:id', authenticate, validate(updateTaskSchema), taskController.update);

/**
 * @openapi
 * /tasks/{id}:
 *   delete:
 *     summary: Supprime logiquement une tâche (soft delete)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tâche supprimée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès interdit
 *       404:
 *         description: Tâche introuvable
 *       409:
 *         description: Tâche déjà supprimée
 */
router.delete('/:id', authenticate, validate(taskIdParamsSchema), taskController.remove);

/**
 * @openapi
 * /tasks/{id}/restore:
 *   patch:
 *     summary: Restaure une tâche supprimée logiquement (admin uniquement)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tâche restaurée
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès interdit
 *       404:
 *         description: Tâche supprimée introuvable
 */
router.patch('/:id/restore', authenticate, validate(taskIdParamsSchema), taskController.restore);

module.exports = router;
