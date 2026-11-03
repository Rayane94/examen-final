# Rapport de mise en production et maintenance — E21 à E29

**Application :** site e-commerce React / Express / MongoDB avec API Gateway et deux microservices.  
**Contexte :** correction du projet fourni dans `exam.zip`, Cloud Campus.  
**Statut :** code préparé ; les tests de production et les captures doivent être réalisés sur l'environnement du candidat.  
**Date :** 3 novembre 2026.

## Synthèse de l'architecture

Navigateur → Nginx (frontend React) → API Express (`/api`) → MongoDB.  
API Express → gateway privée → service de notifications / service d'audit du stock.  
L'API est responsable de la mise à jour effective des stocks et des commandes. Aucune clé ni URI privée n'est livrée dans l'archive corrigée.

## E21 — Choix d'hébergement cloud

**Proposition :** environnement Linux sur VPS compatible Docker Compose pour avoir tous les microservices avec réseau privé, proxy TLS Caddy et gestion centralisée, ou Render + MongoDB Atlas avec services séparés selon quota/limitations. Critères : coût, sécurité réseau, support des conteneurs, HTTPS, persistances, observabilité, disponibilité, SMTP. La VM Debian 13 sert à la préproduction locale, **pas de preuve de production publique**.

**Preuves à ajouter :** comparatif d'offres, choix justifié, captures de l'hébergeur et adresse publique fonctionnelle.

## E22 — Environnement de production sécurisé

**Code fourni :** `.env.example`, script de génération de secrets, réseaux Docker internes, DB non publiée, séparation dev/prod, cookies HttpOnly, vérifications backend de rôles, validation des requêtes, secrets non inclus dans le ZIP, compte admin non créé par défaut. En production, prévoir un firewall 80/443 seulement, accès SSH par clé, mises à jour système et MongoDB Atlas avec allowlist réseau.

**Preuves à ajouter :** paramètres des secrets (noms uniquement), règles réseau, absence de base MongoDB exposée, test de refus de route admin par user.

## E23 — Nom de domaine, DNS et HTTPS

**Préparation :** `deploy/compose.cloud.yml` + `deploy/Caddyfile`. Créer des sous-domaines DNS (`preprod.domaine.tld`, `app.domaine.tld`) pointant sur le bon serveur. Ouvrir 80/443, configurer une valeur `APP_DOMAIN` différente et un projet Compose distinct pour chaque environnement. Caddy provisionne automatiquement TLS quand les conditions DNS/réseau sont satisfaites.

**Non réalisé :** réservation et paramétrage DNS réel, émission/vérification d'un certificat public. **Preuves à ajouter :** captures DNS, URL HTTPS et résultat de vérification du certificat.

## E24 — Déploiement automatisé et conteneurisation

**Code fourni :** cinq Dockerfiles pour frontend/backend/gateway/notifications/stock, `docker-compose.yml`, service MongoDB 7 avec volume, healthchecks, branches `preprod` et `main`, `.github/workflows/ci.yml` pour tests/builds et `.github/workflows/deploy.yml` comme exemple de déploiement SSH.

**Commandes :** `bash scripts/setup.sh`, `COMPOSE_PARALLEL_LIMIT=1 docker compose build`, `docker compose up -d`, `docker compose ps`. Pour production, configurer `.env.prod`, hôte distant autorisé et secrets GitHub `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`, `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PATH` dans chaque environnement GitHub.

**Non réalisé :** exécution de workflows sur GitHub, push et déploiement public. **Preuves à ajouter :** état des workflows, conteneurs healthy, historique de déploiement.

## E25 — Journalisation et audit

**Code fourni :** logs JSON structurés (heure, niveau, événement) pour les opérations critiques ; identifiant de requête (`X-Request-ID`), statut et durée HTTP ; absence de secrets dans les logs ; journaux des microservices via stdout. Collecte avec `docker compose logs`, stockage/rotation complémentaires à configurer sur l'hébergeur.

**Preuves à ajouter :** sortie des logs après inscription, connexion, commande et échec de validation ; rotation/rétention configurées en production.

## E26 — Supervision et alertes

**Code fourni :** `/health` et `/api/health`, `healthcheck` Docker, service Uptime Kuma optionnel via `docker compose --profile monitoring up -d`. Configurer dans Uptime Kuma les sondes HTTP frontend/backend/gateway et alertes par mail/webhook si service mail fourni.

**Non réalisé :** sondes Uptime Kuma créées et alertes testées dans un service live. **Preuves à ajouter :** captures sonde UP/DOWN, paramètres d'alerte et notification reçue.

## E27 — Bugs et qualité logicielle

**Bugs corrigés :** backend admin routes non montées ; Docker Compose incomplet et ports microservices erronés ; URLs localhost codées en dur ; suppression de commande vide ; validation commande simulée ; statut non validé ; clés React incorrectes ; mutation de l'état du panier ; formulaires de livraison non initialisés. Gestion des erreurs et checks ajoutés. Le code d'exemple `App.test.js` qui attendait "learn react" a été remplacé.

**Tests effectués dans l'environnement de préparation :** `node --test backend/tests/*.test.js` → **6/6 réussis** ; analyse de syntaxe `node --check` sur les sources backend/gateway/microservices → réussie. **À tester sur la VM :** Docker Compose, les API réelles, inscription, connexion, panier, commande, admin, mise à jour stock.

## E28 — Sécurité applicative

**Risques initiaux et correctifs :**

| Risque initial | Correction |
|---|---|
| Prix fournis par navigateur | Prix et total calculés depuis les produits MongoDB |
| JWT dans `localStorage` | Cookie de session HttpOnly, SameSite et HTTPS en production |
| Log password/token/URI | Suppression et logs structurés sans secrets |
| Contrôle admin incomplet | Authentification + contrôle de rôle dans l'API |
| Stock arbitraire / quantité négative | Validation type entier et bornes |
| Inscription sans contrôle | Validation serveur, hash bcrypt et rôle `user` forcé |
| Microservices directement accessibles | Réseau Docker privé + token gateway |
| Réponses d'erreur peu robustes | Codes HTTP normalisés et erreurs génériques |

**Limitations restantes :** pas de paiement effectif ; besoin de transactions MongoDB répliquées pour une atomicité multi-produits stricte ; durcissement CSRF complémentaire recommandé pour déploiements multi-origines ; audit npm réseau à exécuter, vérifier les versions transitoires ; SMTP réel facultatif.

**Preuves à ajouter :** refus 401 sans connexion, 403 avec rôle user, 400 pour quantité négative, 409 stock insuffisant, aucun mot de passe exposé.

## E29 — Documentation et changelog

**Code fourni :** `README.md`, `CHANGELOG.md`, `docs/ROUTES_GENEREES.md`, script `node scripts/generate-docs.js` générant un inventaire des routes depuis le code, `.env.example` et commandes de diagnostic. Captures requises par la consigne à ajouter à la version finale.

## Captures d'écran à intégrer au rendu

1. `docker compose ps` : services lancés, santé OK.
2. Accueil React et liste des cinq produits après le seeding.
3. Inscription et connexion utilisateur.
4. Ajout panier, page livraison et validation commande.
5. Interface d'administration et changement de statut.
6. Erreur de formulaire (400) et refus d'accès non-admin (403).
7. Résultat des tests unitaires et `npm audit`.
8. Logs JSON et supervision Uptime Kuma.
9. Historique GitHub Actions / CD, DNS et HTTPS de préprod/prod (si effectivement déployés).

**Ne pas inclure dans le rapport les mots de passe, clés, tokens ou URI avec identifiants.** Les accès de vérification doivent être communiqués par un canal accepté par l'établissement et distinct du dépôt public.

## Validation finale

| Travail | État dans l'archive | À faire pendant l'examen |
|---|---|---|
| Correctifs applicatifs E27–E28 | Code préparé | Tester bout en bout, audit dépendances |
| Docker Compose E24 | Configuré | Builder, lancer, capturer |
| Préproduction | Config locale fournie | Vérifier conteneurs et API |
| Production E21–E23 | Exemple VPS/HTTPS | Héberger, régler DNS/SSL, prouver |
| CI/CD E24 | Workflows créés | Push, connecter secrets/runner, observer succès |
| Logs E25 | Code ajouté | Capturer logs et preuve de rétention |
| Supervision E26 | Sondes possibles | Configurer Uptime Kuma, alertes |
| Documentation E29 | README/Changelog/routes | Ajouter captures et accès de test |
