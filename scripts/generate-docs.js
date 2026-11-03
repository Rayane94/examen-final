// Lightweight route inventory generated from Express route source files.
const fs = require('fs'); const path = require('path');
const dir = path.join(__dirname, '../backend/routes');
const routes = [];
const prefixes = {authRoutes:'/api/auth',productRoutes:'/api/products',orderRoutes:'/api/orders',adminRoutes:'/api/admin'};
for (const name of fs.readdirSync(dir)) {
  if (!name.endsWith('.js')) continue;
  const text = fs.readFileSync(path.join(dir,name),'utf8');
  const prefix = prefixes[name.replace('.js','')] || '';
  for (const match of text.matchAll(/router\.(get|post|put|patch|delete)\(['"]([^'"]+)['"]/g)) {
    routes.push(`| ${match[1].toUpperCase()} | \`${prefix}${match[2] === '/' ? '' : match[2]}\` | ${name} |`);
  }
}
const doc = '# Inventaire des routes (généré depuis le code)\n\nExécution : `node scripts/generate-docs.js`\n\n| Méthode | Route | Source |\n|---|---|---|\n' + routes.join('\n') + '\n';
fs.mkdirSync(path.join(__dirname,'../docs'),{recursive:true});
fs.writeFileSync(path.join(__dirname,'../docs/ROUTES_GENEREES.md'),doc);
console.log(`${routes.length} routes documentées`);
