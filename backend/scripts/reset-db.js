const mongoose = require('mongoose');
const config = require('../src/config/env');

async function resetDatabase() {
  if (config.env === 'production') {
    console.error('CRITICAL: Cannot run db:reset in production!');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB for reset...');
    await mongoose.connect(config.mongoUri);

    console.log('Dropping database...');
    await mongoose.connection.db.dropDatabase();
    console.log('✅ Database reset successfully.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  }
}

resetDatabase();
