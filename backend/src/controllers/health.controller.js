const ApiResponse = require('../utils/ApiResponse');
const { mongoose } = require('../config/database');

const DB_STATUS_LABELS = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

const getHealth = (req, res) => {
  const dbStatus = DB_STATUS_LABELS[mongoose.connection.readyState] || 'unknown';

  ApiResponse.success(res, {
    message: 'API opérationnelle',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: {
        status: dbStatus,
      },
    },
  });
};

module.exports = { getHealth };
