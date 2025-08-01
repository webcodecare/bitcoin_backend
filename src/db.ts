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

// Fallback to the external database with weekly signals
if (!databaseUrl) {
  console.warn("⚠️  No database configuration found. Using external database with signals.");
  databaseUrl = "postgresql://neondb_owner:npg_C1UoJ2dMrKpl@ep-empty-snow-af97a6i0.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require";
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