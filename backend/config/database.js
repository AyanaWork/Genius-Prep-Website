const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

/**
 * Postgres pool
 * -------------
 * Two ways to configure (DATABASE_URL wins if both are set):
 *
 *   1) Single connection string — preferred for hosted Postgres like
 *      Supabase, Render, Railway, etc.:
 *        DATABASE_URL=postgresql://user:password@host:5432/dbname
 *
 *   2) Individual variables — handy for local dev:
 *        DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME
 *
 * SSL is enabled automatically for hosted databases. Supabase requires
 * SSL but its certificate isn't in Node's default trust store, so we
 * disable strict cert verification for the connection. That's the
 * standard pattern for managed Postgres providers.
 */

// ---- Friendly startup checks --------------------------------------
// Bail early with a clear message when neither config method is in
// place, instead of letting pg throw a cryptic SASL error later.
const hasUrl = !!process.env.DATABASE_URL;
const hasIndividual = !!process.env.DB_PASSWORD && !!process.env.DB_HOST;

if (!hasUrl && !hasIndividual) {
  const envPath = path.resolve(process.cwd(), '.env');
  const envExists = fs.existsSync(envPath);

  console.error('\n========================================================');
  console.error('❌ Database is not configured.');
  console.error('--------------------------------------------------------');
  console.error(`.env file:   ${envExists ? envPath + '  (found)' : 'NOT FOUND in ' + process.cwd()}`);
  console.error('Set ONE of:');
  console.error('  DATABASE_URL=postgresql://user:password@host:5432/db');
  console.error('  …or all of: DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME');
  console.error('========================================================\n');
}

const isHostedDB =
  !!process.env.DATABASE_URL ||
  process.env.DB_HOST?.includes('supabase.co') ||
  process.env.DB_HOST?.includes('amazonaws.com') ||
  process.env.DB_HOST?.includes('render.com') ||
  process.env.DB_SSL === 'true';

const sslConfig = isHostedDB ? { rejectUnauthorized: false } : false;

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: sslConfig
    })
  : new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      database: process.env.DB_NAME,
      ssl: sslConfig
    });

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    if (err.message?.includes('password must be a string')) {
      console.error('→ Hint: DATABASE_URL or DB_PASSWORD is empty/undefined.');
      console.error('  Open backend/.env and confirm the value is set.');
    }
    return;
  }
  console.log('✅ Database connected successfully');
  release();
});

module.exports = pool;
