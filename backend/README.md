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
| `DATABASE_URL` | Réservé à la future intégration base de données |
| `LOG_LEVEL` | Niveau de log (`info`, `debug`, ...) |

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
│   ├── services/        # logique métier
│   ├── models/          # modèles de données (à intégrer avec une BDD)
│   ├── repositories/    # accès aux données (à intégrer avec une BDD)
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
- **Services** : contiennent la logique métier, indépendants d'Express.
- **Repositories** : encapsulent l'accès aux données (prêt pour une intégration PostgreSQL future).
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

Aucune base de données n'est encore connectée. L'architecture (`models/`, `repositories/`) est prête pour l'intégration d'une base comme PostgreSQL, sans ORM imposé à ce stade.
