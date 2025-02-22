// config/connectDB.js
const { Client } = require('pg');

const connectDB = async () => {
  // Use the environment variable if available, otherwise use a hardcoded connection string
  const pgURI = process.env.PG_URI || 'postgresql://neondb_owner:npg_zb9UoxEu3lhY@ep-patient-sound-a5tbt0k1-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';

  // Create a new client
  const client = new Client({
    connectionString: pgURI,
  });

  try {
    // Connect to PostgreSQL
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Return the client so we can use it elsewhere
    return client;
  } catch (error) {
    console.error('PostgreSQL connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
