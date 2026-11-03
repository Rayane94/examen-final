# Procédure de validation qualité — E25 à E29

## E25 — Logs Pino

Les quatre applications Node.js (backend, gateway, notifications, stock-management) écrivent des événements JSON sur stdout.

```bash
docker compose logs --tail=40 backend gateway notifications stock-management
```

Les journaux ne doivent pas afficher de mot de passe SMTP, JWT, token interne ou URI MongoDB avec credentials. Le backend journalise les événements HTTP avec `X-Request-ID`, durée et statut. Pour la production, configurer une politique de rotation et conservation des journaux Docker et documenter ses valeurs.

## E27 — Régressions fonctionnelles

```bash
node --test backend/tests/*.test.js
bash scripts/smoke.sh
```

Vérifier dans le navigateur : inscription, connexion, commandes, décrémentation stock, route `/admin`, détails d'une commande, statuts, mise à jour du stock. Vérifier les deux emails : création de commande et changement de statut. Après recréation du backend, vérifier `/api/health` **sans devoir redémarrer Nginx** (résolution Docker périodique : jusqu'à dix secondes).

## E28 — Sécurité

- Sans authentification : `/api/admin/orders` retourne **401**.
- Avec un compte `user` : `/api/admin/orders` retourne **403**.
- Entrée HTML/JS dans l'adresse de livraison : **400** (serveur).
- Identifiant, quantité ou statut incorrect : **400** ; rupture de stock : **409**.
- Regarder le cookie `session` : `HttpOnly`, `SameSite=Lax`, `Secure` pour HTTPS.
- Test CORS : les écritures avec une origine tierce non autorisée doivent retourner **403**.

```bash
curl -i http://localhost:3000/api/admin/orders
curl -i -X POST http://localhost:3000/api/auth/register -H 'Content-Type: application/json' -d '{"username":"x","email":"incorrect","password":"123"}'
curl -i -X POST http://localhost:3000/api/auth/register -H 'Content-Type: application/json' -H 'Origin: https://site-non-autorise.example' -d '{"username":"test123","email":"test123@example.com","password":"passpass123"}'
```

**Audit dépendances constaté avant correctif :** backend 0 vulnérabilité ; frontend 74 (11 faibles, 50 modérées, 13 élevées, 0 critique), principalement issues de Create React App et de ses outils. Ne pas lancer `npm audit fix --force` sans migration contrôlée. Relancer l'audit après installation des nouvelles dépendances, et consigner le nouveau résultat.

## E29 — Documentation

Les fonctions backend comportent des commentaires JSDoc (`@param`, `@returns`). Exécuter :

```bash
node scripts/generate-docs.js
```

La documentation des routes est enregistrée dans `docs/ROUTES_GENEREES.md`. Compléter les captures d'écran dans le rapport `docs/RAPPORT_E21_E29.md` avant le rendu final. Les accès de vérification ne doivent pas figurer dans le dépôt public.
