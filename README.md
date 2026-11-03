# Examen E21–E29 — Application e-commerce MERN corrigée

Source : archive `exam.zip` fournie pour l'évaluation Cloud Campus (React, Express, MongoDB, gateway, notifications, stock). Le projet initial a été nettoyé des dossiers `node_modules` et des `.env` sensibles. Le code corrigé conserve les pages e-commerce existantes.

## Démarrage sur la VM Debian 13

**Ne pas travailler dans le dossier ObsoCPE.** Décompresser ce projet dans un dossier indépendant, par exemple `~/examen-mern`.

```bash
cd ~/examen-mern/exam1_corrige   # Adapter si le dossier extrait porte un autre nom
bash scripts/setup.sh            # Génère .env avec JWT_SECRET et INTERNAL_SERVICE_TOKEN
COMPOSE_PARALLEL_LIMIT=1 docker compose build
COMPOSE_PARALLEL_LIMIT=1 docker compose up -d
COMPOSE_PARALLEL_LIMIT=1 docker compose ps
```

Accès : **http://localhost:3000**. API : `http://localhost:3000/api/health` et `http://localhost:3000/api/products`. MongoDB reste privé au réseau Docker, et `localhost:3000` n'est accessible que depuis la VM. Avec 8 Go RAM et environ 7,7 Go libres sur `/`, surveiller `df -h /`.

Après démarrage :

```bash
docker compose exec backend node seeder.js  # Insère les produits sans supprimer les produits existants
bash scripts/smoke.sh
docker compose logs --tail=100 backend gateway mongo
```

Pour créer un compte administrateur de test, ajouter **localement** `ADMIN_USERNAME`, `ADMIN_EMAIL` et `ADMIN_PASSWORD` (12 caractères minimum) au service `backend` du fichier Compose, puis redémarrer ce service et relancer `docker compose exec backend node seeder.js`. Ne jamais publier ces secrets dans Git ni dans le rapport. Un utilisateur standard peut s'inscrire depuis l'interface. Un rôle admin ne peut pas être fourni à l'inscription.

Pour arrêter **uniquement l'application d'examen** :

```bash
docker compose down
```

**Ne pas utiliser `docker compose down -v`** sauf si tu veux réellement supprimer la base de données d'examen.

## Vérifications

```bash
node --test backend/tests/*.test.js
node scripts/generate-docs.js
COMPOSE_PARALLEL_LIMIT=1 docker compose ps
COMPOSE_PARALLEL_LIMIT=1 docker compose logs --tail=60
```

Tests frontend (depuis `frontend/`, si tu travailles sans Docker) : `npm ci && CI=true npm test -- --watchAll=false`. Pour produire le build : `CI=false npm run build`.

## Architecture

- `frontend/` : React 18, Nginx dans Docker, interface sur 3000, reverse proxy `/api` vers Express.
- `backend/` : Express, JWT en cookie HttpOnly, API `/api`, calcul côté serveur, Mongoose.
- `mongo/` (service Compose) : MongoDB 7, volume `mongo_data`.
- `gateway/` : proxy privé avec secret interne de service.
- `microservices/notifications/` : Nodemailer ; **SMTP désactivé tant qu'il n'est pas configuré**.
- `microservices/stock-management/` : enregistrement des événements de stock ; les stocks réels sont mis à jour par le backend.
- `deploy/compose.cloud.yml` + `deploy/Caddyfile` : exemple d'hébergement VPS HTTPS, à configurer, non déployé.
- `.github/workflows/` : CI et modèle CD via SSH, à relier à des secrets/serveurs autorisés.
- `docs/ROUTES_GENEREES.md` : documentation des routes générée à partir du code.
- `docs/RAPPORT_E21_E29.md` : analyse, corrections et zones de preuves à compléter.

## Important pour le rendu

Ce ZIP est **préparé et contrôlé statiquement**, mais **n'a pas été démarré sous Docker dans cet environnement de génération**. Le succès des builds, les captures, le SMTP, les DNS/SSL et la mise en ligne ne doivent pas être présentés comme validés sans effectuer les tests dans la VM ou sur l'hébergeur.

La configuration initiale comprenait des fichiers `.env`. Ils ont été exclus du ZIP corrigé : si leur contenu a déjà été diffusé, envisager la rotation des secrets. Les méthodes de paiement affichées sont des choix de commande et **pas un encaissement réel**.
