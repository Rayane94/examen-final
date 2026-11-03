require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
const logger = require('./utils/logger');
const products = [
  { name: 'Ordinateur Portable', price: 1000, description: 'Ordinateur performant', stock: 20 },
  { name: 'Smartphone', price: 700, description: 'Téléphone OLED', stock: 50 },
  { name: 'Casque Audio', price: 150, description: 'Casque sans fil', stock: 30 },
  { name: 'Tablette', price: 400, description: 'Tablette polyvalente', stock: 25 },
  { name: 'Clavier Mécanique', price: 120, description: 'Clavier mécanique', stock: 15 },
];
async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  for (const p of products) await Product.updateOne({ name: p.name }, { $setOnInsert: p }, { upsert: true });
  // ADMIN_* are deliberately optional. Never create an account with a predictable password.
  if (process.env.ADMIN_USERNAME && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD?.length >= 12) {
    if (!(await User.exists({ username: process.env.ADMIN_USERNAME }))) {
      await User.create({ username: process.env.ADMIN_USERNAME, email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, role: 'admin' });
      logger.info('admin_account_created');
    }
  }
  logger.info('seed_complete');
  await mongoose.disconnect();
}
seed().catch(() => { logger.error('seed_failed'); process.exitCode = 1; mongoose.disconnect(); });
