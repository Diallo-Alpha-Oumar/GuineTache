# Guide de déploiement — GuineTache

Ce projet est composé de deux applications indépendantes :

- `backend/` — API Express + MongoDB (port par défaut `5000`)
- `frontend/` — application React/Vite (servie en statique après build, port `80` dans l'image Docker)

Chacune dispose de son propre `Dockerfile` pour un déploiement conteneurisé.

## 1. Backend

### Variables d'environnement requises

Voir `backend/.env.example` pour la liste complète. En production, ces variables sont **obligatoires** (le serveur refuse de démarrer sinon) :

- `JWT_SECRET`, `JWT_REFRESH_SECRET`, `COOKIE_SECRET` — à générer aléatoirement (ex. `openssl rand -base64 32`), jamais réutiliser les valeurs de développement
- `MONGODB_URI` — connexion vers une base MongoDB accessible (Atlas, conteneur, VM)

Autres variables importantes : `CORS_ORIGIN` (doit inclure l'URL du frontend déployé), `SMTP_*` (pour l'envoi réel des e-mails OTP — sans SMTP configuré, les e-mails ne sont pas envoyés et l'app le journalise).

### Build & run (Docker)

```bash
cd backend
docker build -t guinetache-backend .
docker run -p 5000:5000 --env-file .env guinetache-backend
```

Le conteneur ne contient pas MongoDB : pointez `MONGODB_URI` vers une instance externe (Atlas, ou un conteneur `mongo` séparé sur le même réseau Docker).

### Sans Docker

```bash
cd backend
npm ci
npm start
```

## 2. Frontend

### Variable d'environnement

- `VITE_API_URL` — URL publique de l'API backend (ex. `https://api.mondomaine.com/api/v1`). Elle est injectée **au moment du build** (Vite), pas au runtime.

### Build & run (Docker)

```bash
cd frontend
docker build --build-arg VITE_API_URL=https://api.mondomaine.com/api/v1 -t guinetache-frontend .
docker run -p 8080:80 guinetache-frontend
```

L'image sert les fichiers statiques buildés via nginx (`nginx.conf` gère le fallback SPA vers `index.html`).

### Sans Docker

```bash
cd frontend
npm ci
npm run build
npm run preview   # ou servir dist/ avec n'importe quel serveur statique
```

## 3. Pistes d'hébergement (non mises en œuvre ici)

Aucun déploiement réel n'a été effectué — ce guide prépare uniquement le projet à être déployable. Options courantes pour ce type de stack :

- **Backend** : Render, Railway, Fly.io — n'importe quelle plateforme supportant un `Dockerfile` ou Node.js directement
- **Base de données** : MongoDB Atlas (cluster gratuit suffisant pour démarrer)
- **Frontend** : Vercel, Netlify (déploiement direct du build Vite) ou la même plateforme que le backend via l'image Docker/nginx fournie

Points d'attention lors d'un déploiement réel :

- Mettre à jour `CORS_ORIGIN` (backend) avec l'URL exacte du frontend déployé
- Mettre à jour `VITE_API_URL` (frontend) avec l'URL exacte du backend déployé
- Générer de nouveaux secrets JWT/cookie (ne jamais réutiliser ceux de développement)
- Configurer un SMTP réel si l'envoi d'e-mails (OTP, réinitialisation) doit fonctionner en production

## 4. Vérifications effectuées

- ✅ `npm run build` (frontend) : build de production réussi
- ✅ `npm test` (backend) : suite Jest complète au vert
- ✅ `npm run test:e2e` (frontend) : suite Playwright au vert
- ⚠️ Les `Dockerfile` n'ont **pas** pu être construits/testés dans cet environnement (Docker non installé sur la machine). Ils suivent des schémas standards (multi-stage, image `node:20-alpine`/`nginx:1.27-alpine`) mais méritent une vérification `docker build` avant un déploiement réel.
