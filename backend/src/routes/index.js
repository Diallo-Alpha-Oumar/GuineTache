const express = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const taskRoutes = require('./task.routes');
const userRoutes = require('./user.routes');
const notificationRoutes = require('./notification.routes');
const settingsRoutes = require('./settings.routes');

const router = express.Router();

router.use(healthRoutes);
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);
router.use('/settings', settingsRoutes);

module.exports = router;
