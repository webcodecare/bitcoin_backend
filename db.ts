import { config } from 'dotenv';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema.js";

// Load environment variables from .env file and system environment
config();

// Additional environment variable loading from system
if (!process.env.DATABASE_URL && process.env.POSTGRES_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_URL;
}

neonConfig.webSocketConstructor = ws;

// Check for DATABASE_URL with better error handling
let databaseUrl = process.env.DATABASE_URL;

// If DATABASE_URL is not available, check for Replit database setup
if (!databaseUrl && (process.env.REPLIT_DB_URL || process.env.POSTGRES_URL)) {
  databaseUrl = process.env.REPLIT_DB_URL || process.env.POSTGRES_URL;
  process.env.DATABASE_URL = databaseUrl;
}

// Try to construct DATABASE_URL from individual PostgreSQL variables
if (!databaseUrl && process.env.PGHOST && process.env.PGUSER && process.env.PGDATABASE) {
  const port = process.env.PGPORT || '5432';
  const password = process.env.PGPASSWORD || '';
  const constructedUrl = `postgresql://${process.env.PGUSER}:${password}@${process.env.PGHOST}:${port}/${process.env.PGDATABASE}`;
  console.log("Constructed DATABASE_URL from individual PostgreSQL variables");
  databaseUrl = constructedUrl;
  process.env.DATABASE_URL = constructedUrl;
}

// Fallback to a default connection if running in development without database
if (!databaseUrl && process.env.NODE_ENV === 'development') {
  console.warn("⚠️  No database configuration found. Using in-memory storage for development.");
  console.warn("   To use a real database, set DATABASE_URL or provision a database.");
  
  // Create a minimal fallback that won't crash the app
  databaseUrl = 'postgresql://user:pass@localhost:5432/testdb';
  process.env.DATABASE_URL = databaseUrl;
}

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database? Available env vars: " + 
    Object.keys(process.env).filter(key => key.includes('PG') || key.includes('DATABASE')).join(', ')
  );
}

console.log("Final DATABASE_URL configured:", process.env.DATABASE_URL ? "✓ Connected" : "✗ Missing");

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
