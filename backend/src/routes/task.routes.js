const express = require('express');
const taskController = require('../controllers/task.controller');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth.middleware');
const { createTaskSchema } = require('../validators/task.validator');

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

module.exports = router;
