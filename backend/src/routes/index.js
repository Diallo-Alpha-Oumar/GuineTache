const express = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const taskRoutes = require('./task.routes');

const router = express.Router();

router.use(healthRoutes);
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);

// Les futures ressources (ex: users, ...) seront montées ici :
// router.use('/users', userRoutes);

module.exports = router;
