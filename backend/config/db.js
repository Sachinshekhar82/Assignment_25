const mongoose = require('mongoose');

async function connectDB() {
  let uri = process.env.MONGO_URI;

  if (!uri) {
    console.log('MONGO_URI is not set. Attempting to start in-memory MongoDB server...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log(`In-memory MongoDB started at: ${uri}`);
    } catch (err) {
      console.warn('Could not start MongoMemoryServer:', err.message);
    }
  }

  if (!uri) {
    console.error('MONGO_URI is not set and MongoMemoryServer unavailable.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;