const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
const { connectDB, disconnectDB } = require('./config/database');

let server;

const start = async () => {
  try {
    await connectDB();

    server = app.listen(env.PORT, () => {
      logger.info(`Serveur démarré en mode ${env.NODE_ENV} sur le port ${env.PORT}`);
      logger.info(`Documentation API disponible sur http://localhost:${env.PORT}/api-docs`);
    });
  } catch (error) {
    logger.error(`Échec du démarrage du serveur: ${error.message}`);
    process.exit(1);
  }
};

const shutdown = (signal) => {
  logger.info(`${signal} reçu, arrêt gracieux du serveur...`);
  server.close(async () => {
    logger.info('Serveur HTTP arrêté proprement.');
    await disconnectDB();
    logger.info('Connexion MongoDB fermée.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.stack || error.message}`);
  process.exit(1);
});

start();
