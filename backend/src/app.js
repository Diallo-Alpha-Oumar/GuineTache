const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const env = require('./config/env');
const logger = require('./config/logger');
const corsOptions = require('./config/cors');
const swaggerSpec = require('./config/swagger');
const { globalLimiter } = require('./middlewares/rateLimiter');
const sanitize = require('./middlewares/sanitize');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const routes = require('./routes');

const app = express();

// Fait confiance au premier proxy (nécessaire derrière un load balancer / reverse proxy)
app.set('trust proxy', 1);

// Sécurité HTTP headers
app.use(helmet());

// CORS
app.use(cors(corsOptions));

// Compression des réponses HTTP
app.use(compression());

// Parsing du corps des requêtes avec limitation de taille
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookies signés
app.use(cookieParser(env.COOKIE_SECRET));

// Protection contre la pollution des paramètres HTTP
app.use(hpp());

// Sanitization des entrées (XSS / injection NoSQL basique)
app.use(sanitize);

// Logs HTTP
app.use(
  morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    stream: { write: (message) => logger.http?.(message.trim()) || logger.info(message.trim()) },
  })
);

// Rate limiting global
app.use(globalLimiter);

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes versionnées
app.use(env.API_PREFIX, routes);

// 404
app.use(notFound);

// Gestion centralisée des erreurs
app.use(errorHandler);

module.exports = app;
