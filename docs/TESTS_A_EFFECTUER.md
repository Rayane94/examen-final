# Checklist de validation dans Debian avant remise

1. `bash scripts/setup.sh` : `.env` local créé, jamais dans Git.
2. `COMPOSE_PARALLEL_LIMIT=1 docker compose build` : toutes les images compilent.
3. `docker compose up -d && docker compose ps` : six services UP et healthchecks OK.
4. `docker compose exec backend node seeder.js` : cinq produits ajoutés.
5. `bash scripts/smoke.sh` : trois sondes HTTP réussies.
6. Navigateur `http://localhost:3000` : accueil, inscription, connexion, panier et choix de livraison/paiement.
7. Requête commande : le prix d'un produit ajouté à la requête ne doit pas modifier le montant facturé.
8. Requête admin sans cookie : HTTP 401 ; cookie utilisateur simple : HTTP 403.
9. Connexion admin créée explicitement via variables privées : état commande et stock modifiables.
10. `node --test backend/tests/*.test.js` : six tests de validation.
11. `cd frontend && npm ci && CI=true npm test -- --watchAll=false` : vérifier le test React.
12. `npm audit` dans chaque projet Node : recenser et corriger les vulnérabilités non résolues.
13. `docker compose logs --tail=100 backend` : identifiants de requêtes et logs sans secrets.
14. `docker compose --profile monitoring up -d` : sonde HTTP et une alerte d'indisponibilité configurées manuellement.
15. Produire des captures réelles et compléter `docs/RAPPORT_E21_E29.md`.

**À vérifier avant toute mention de production :** vrai domaine, DNS, HTTPS, préproduction séparée, pipeline GitHub vert, hébergeur et base de données accessibles. Envoi de notification mail désactivé par défaut.
