import fs from 'fs';
import path from 'path';
import { pool } from '../src/db';

async function runMigrations() {
  console.log('Running database migrations...');
  const migrationsDir = path.resolve(__dirname, '../migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.error(`Migrations folder not found: ${migrationsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(migrationsDir).filter(file => file.endsWith('.sql')).sort();

  if (files.length === 0) {
    console.log('No migration files found.');
    return;
  }

  const client = await pool.connect();

  try {
    for (const file of files) {
      console.log(`Executing migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');

      console.log(`✅ Applied migration: ${file}`);
    }
    console.log('🎉 All migrations applied successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
