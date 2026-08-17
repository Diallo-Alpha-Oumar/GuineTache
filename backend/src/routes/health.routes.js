const express = require('express');
const { getHealth } = require('../controllers/health.controller');

const router = express.Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Vérifie l'état de l'API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: L'API fonctionne correctement
 */
router.get('/health', getHealth);

module.exports = router;
