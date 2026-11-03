# Inventaire des routes (généré depuis le code)

Exécution : `node scripts/generate-docs.js`

| Méthode | Route | Source |
|---|---|---|
| GET | `/api/admin/orders` | adminRoutes.js |
| PUT | `/api/admin/orders/:id/status` | adminRoutes.js |
| PUT | `/api/admin/orders/:id/validate` | adminRoutes.js |
| GET | `/api/admin/products` | adminRoutes.js |
| PUT | `/api/admin/products/:id/stock` | adminRoutes.js |
| POST | `/api/auth/login` | authRoutes.js |
| POST | `/api/auth/register` | authRoutes.js |
| POST | `/api/auth/logout` | authRoutes.js |
| GET | `/api/auth/me` | authRoutes.js |
| GET | `/api/orders` | orderRoutes.js |
| POST | `/api/orders` | orderRoutes.js |
| DELETE | `/api/orders/:id` | orderRoutes.js |
| PUT | `/api/orders/:id/validate` | orderRoutes.js |
| PUT | `/api/orders/:orderId/status` | orderRoutes.js |
| GET | `/api/products` | productRoutes.js |
| PUT | `/api/products/:productId/stock` | productRoutes.js |
