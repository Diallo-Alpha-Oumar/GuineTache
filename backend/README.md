# GuineTache — Backend API

Socle backend Express.js professionnel, sécurisé et modulaire, prêt à accueillir les futurs modules métier de l'API GuineTache.

## Prérequis

- Node.js >= 18
- npm >= 9

## Installation

```bash
cd backend
npm install
```

## Configuration

1. Copier le fichier d'exemple :

```bash
cp .env.example .env
```

2. Renseigner les variables dans `.env` (voir le tableau ci-dessous). **Ne jamais committer `.env`.**

| Variable | Description |
|---|---|
| `NODE_ENV` | `development`, `test` ou `production` |
| `PORT` | Port d'écoute du serveur |
| `API_PREFIX` | Préfixe de versionnement de l'API (`/api/v1`) |
| `CORS_ORIGIN` | Origines autorisées, séparées par des virgules |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Secret et durée de vie du token d'accès |
| `JWT_REFRESH_SECRET` / `JWT_REFRESH_EXPIRES_IN` | Secret et durée de vie du refresh token |
| `COOKIE_SECRET` | Secret de signature des cookies |
| `RATE_LIMIT_*` / `AUTH_RATE_LIMIT_*` | Fenêtre et nombre max de requêtes (global et routes sensibles) |
| `BCRYPT_SALT_ROUNDS` | Coût du hashage des mots de passe |
| `MONGODB_URI` | URI de connexion MongoDB (Mongoose) |
| `LOG_LEVEL` | Niveau de log (`info`, `debug`, ...) |
| `APP_NAME` | Nom de l'application (utilisé dans les e-mails) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `MAIL_FROM` | Configuration SMTP pour l'envoi des e-mails (OTP, réinitialisation) |
| `OTP_EXPIRES_IN_MINUTES` / `OTP_MAX_ATTEMPTS` / `OTP_RESEND_COOLDOWN_SECONDS` | Paramètres du code de vérification OTP |

En production, `JWT_SECRET`, `JWT_REFRESH_SECRET` et `COOKIE_SECRET` sont obligatoires (le serveur refuse de démarrer sinon).

## Lancement

### Développement (avec rechargement automatique via nodemon)

```bash
npm run dev
```

### Production

```bash
npm start
```

Le serveur démarre sur `http://localhost:<PORT>`.

- Health check : `GET /api/v1/health`
- Documentation Swagger : `GET /api-docs`

## Tests

```bash
npm test          # exécute la suite Jest (unit + intégration) une fois
npm run test:watch
```

## Qualité de code

```bash
npm run lint       # vérifie le code avec ESLint
npm run lint:fix    # corrige automatiquement ce qui peut l'être
npm run format      # formate le code avec Prettier
```

## Architecture

```
backend/
├── src/
│   ├── config/         # configuration (env, logger, cors, swagger)
│   ├── controllers/     # contrôleurs HTTP (légers, délèguent aux services)
│   ├── routes/          # définition des routes, montées sous /api/v1
│   ├── services/        # logique métier + accès aux données (modèles Mongoose)
│   ├── models/          # schémas Mongoose (User, Task, Notification, Session, Verification)
│   ├── middlewares/      # sécurité, rate limiting, validation, erreurs
│   ├── validators/       # schémas de validation (Zod)
│   ├── utils/            # utilitaires (réponses API, JWT, mots de passe...)
│   ├── constants/        # constantes partagées (codes HTTP, etc.)
│   ├── errors/           # classes d'erreurs personnalisées
│   ├── app.js            # configuration de l'application Express
│   └── server.js         # point d'entrée, démarrage du serveur
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── .gitignore
└── package.json
```

Principes :

- **Controllers** minces : ils reçoivent la requête, appellent un service, renvoient une réponse standardisée.
- **Services** : contiennent la logique métier et l'accès aux données via les modèles Mongoose (pas de couche repository séparée — le projet est volontairement resté simple, un seul ORM/une seule base de données étant utilisés).
- **Réponses API standardisées** via `src/utils/ApiResponse.js` :

```json
{ "success": true, "message": "Opération effectuée avec succès", "data": {} }
{ "success": false, "message": "Description de l'erreur", "errors": [] }
```

- **Gestion d'erreurs centralisée** via `ApiError` (`src/errors/ApiError.js`) et le middleware `src/middlewares/errorHandler.js`, avec distinction entre erreurs opérationnelles (attendues) et erreurs internes (bugs), et masquage des détails sensibles en production.

## Sécurité mise en place

- `helmet` pour les en-têtes HTTP sécurisés
- CORS configurable via `.env`
- `express-rate-limit` : limitation globale + limitation renforcée pour les routes sensibles (ex: futur `/auth/login`)
- Limitation de la taille des payloads JSON/urlencoded (`10kb`)
- Sanitization des entrées (`src/middlewares/sanitize.js`) contre les injections NoSQL basiques et le XSS brut
- `hpp` contre la pollution des paramètres HTTP
- Hashage des mots de passe avec `bcryptjs`
- JWT avec expiration, séparation access/refresh token prête à l'emploi (`src/utils/jwt.js`)
- Cookies signés (`cookie-parser` + `COOKIE_SECRET`)
- Aucun secret en dur dans le code : tout passe par les variables d'environnement

> Ces middlewares réduisent la surface d'attaque mais ne remplacent pas la validation métier (schémas Zod dans `src/validators/`) ni l'usage de requêtes paramétrées lors de l'intégration d'une base de données.

## Versionnement de l'API

Toutes les routes sont montées sous `/api/v1`, permettant une évolution future vers `/api/v2` sans rupture de compatibilité.

## Base de données

MongoDB via Mongoose (`MONGODB_URI`). Modèles : `User`, `Task`, `Notification`, `Session` (refresh tokens), `Verification` (codes OTP).

## Fonctionnalités principales

- **Auth** : inscription avec vérification par OTP e-mail, connexion, refresh token (cookie httpOnly), mot de passe oublié/réinitialisation, changement de mot de passe, avatar.
- **Tasks** : CRUD, suppression douce + restauration (admin), statistiques, filtres.
- **Users** (admin) : liste, activation/désactivation, rôles, suppression.
- **Notifications** : générées automatiquement par le backend lors de l'assignation, la mise à jour ou la complétion d'une tâche (`GET/PATCH/DELETE /notifications`).
