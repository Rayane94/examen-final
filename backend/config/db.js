const mongoose = require('mongoose');
const logger = require('../utils/logger');
module.exports = async function connectDB() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI manquant');
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  logger.info('mongodb_connected'); // Never log credentials/URI.
};
