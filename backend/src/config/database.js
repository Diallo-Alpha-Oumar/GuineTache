const mongoose = require('mongoose');
const env = require('./env');
const logger = require('./logger');

let listenersRegistered = false;

const registerConnectionListeners = () => {
  if (listenersRegistered) return;
  listenersRegistered = true;

  mongoose.connection.on('connected', () => {
    logger.info(`MongoDB connecté (base: ${mongoose.connection.name})`);
  });

  mongoose.connection.on('error', (error) => {
    logger.error(`Erreur de connexion MongoDB: ${error.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB déconnecté');
  });
};

const connectDB = async () => {
  if (!env.MONGODB_URI) {
    throw new Error(
      "Variable d'environnement manquante: MONGODB_URI. Définissez-la dans le fichier .env"
    );
  }

  registerConnectionListeners();

  await mongoose.connect(env.MONGODB_URI);

  return mongoose.connection;
};

const disconnectDB = async () => {
  await mongoose.disconnect();
};

module.exports = { connectDB, disconnectDB, mongoose };
