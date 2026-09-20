import { pool } from '../src/db';

async function testDatabaseConnection() {
  console.log('Testing PostgreSQL connection...');

  try {
    const startTime = Date.now();
    const result = await pool.query('SELECT NOW() as server_time, current_database() as database_name');
    const duration = Date.now() - startTime;

    console.log('✅ PostgreSQL connection successful!');
    console.log(`⏱️ Query duration: ${duration}ms`);
    console.log('📊 Connection details:', result.rows[0]);
  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL database:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

testDatabaseConnection();
