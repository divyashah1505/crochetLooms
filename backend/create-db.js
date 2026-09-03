const { Client } = require('pg');
require('dotenv').config();

async function initDb() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'Divya@15',
    database: 'postgres',
  });

  try {
    await client.connect();
    const dbName = process.env.DB_DATABASE || 'crochet_db';
    const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);

    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database "${dbName}" created successfully in PostgreSQL!`);
    } else {
      console.log(`ℹ️ Database "${dbName}" already exists in PostgreSQL.`);
    }
  } catch (err) {
    console.error('❌ PostgreSQL Connection / Creation Error:', err.message);
  } finally {
    await client.end();
  }
}

initDb();
