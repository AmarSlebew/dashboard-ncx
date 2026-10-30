import postgres from 'postgres';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || '';

// Single shared postgres client with SSL required for Supabase
export const sql = postgres(connectionString, {
  ssl: 'require',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});
