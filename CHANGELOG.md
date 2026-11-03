# Journal des évolutions

## 2026-11-03 — Finalisation qualité et supervision

- **Nginx :** résolution dynamique du backend Docker pour éviter les erreurs 502 après recréation.
- **E25 :** journalisation normalisée avec Pino (backend, gateway, notification, stock), événements JSON lisibles dans Docker.
- **E27–E28 :** tests des entrées HTML/JS et des rôles administrateur ; correction d'affichage du stock côté React.
- **E29 :** commentaires JSDoc sur la validation, l'authentification et les contrôleurs de commandes/stock.
- **Tests réels déclarés par le candidat :** administration, deux notifications SMTP reçues et alertes Uptime Kuma UP/DOWN.
- **Limites :** préproduction/production cloud, DNS et déploiement CD restant à mettre en œuvre ; audit frontend conservant des vulnérabilités connues.


## 2026-11-03 — Correctifs examen

### Sécurité
- Secrets retirés du livrable et remplacés par `.env.example` + script de génération de secrets.
- Logs sensibles (mots de passe, jetons, URI MongoDB, SMTP) retirés.
- Jeton de session placé dans un cookie `HttpOnly; SameSite=Lax`, `Secure` pour le modèle cloud HTTPS.
- Vérification serveur des droits admin et des sessions.
- Vérification d'origine sur requêtes d'écriture et headers HTTP de base.
- Validation forte des entrées (identifiants, quantités, paiements, livraison, inscription).
- Prix de commandes calculés exclusivement depuis MongoDB.
- Notifications accessibles via gateway interne avec token de service.

### Robustesse
- Routes admin rendues accessibles, méthodes de gestion des commandes implémentées.
- Stock décrémenté atomiquement par produit avec compensation sur échec ; limite explicitée dans le rapport.
- Gestion des erreurs et healthchecks.
- Liens API React relatifs, permettant la même origine en local/prod.
- Correction des clés React et de la mise à jour du panier.

### DevOps & documentation
- Dockerfiles multi-stage frontend et Dockerfiles Node pour les autres services.
- Docker Compose intégrant MongoDB, gateway, frontend/backend et microservices.
- CI GitHub Actions, modèle CD, exemple HTTPS avec Caddy.
- Tests Node natifs, documentation des routes générée et rapport E21-E29.

### Limitations non réalisées automatiquement
- Aucun hébergeur, domaine, accès SMTP ni surveillance externe réellement configuré.
- Paiement bancaire non intégré ; choix de méthode uniquement.
- Stock multi-produits sans transaction MongoDB : une coupure brutale au milieu d'une commande reste un risque résiduel.
- Audit de dépendances `npm audit` et build Docker complets à exécuter sur la VM.
