import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { config } from '../config/env';

export async function runMigrations() {
  console.log('🔄 Running database migrations on:', config.db.database);
  
  // Create database connection
  const connection = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    multipleStatements: true,
  });

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${config.db.database}\`;`);

    const schemaCandidates = [
      path.join(__dirname, 'schema.sql'),
      path.join(__dirname, '../database/schema.sql'),
      path.join(__dirname, '../../database/schema.sql'),
      path.join(__dirname, '../../src/database/schema.sql'),
      path.join(process.cwd(), 'database/schema.sql'),
      path.join(process.cwd(), 'backend/dist/database/schema.sql'),
      path.join(process.cwd(), 'schema.sql'),
      path.join(process.cwd(), 'nexalink_crm.sql'),
    ];

    let schemaSql: string | null = null;
    for (const p of schemaCandidates) {
      if (fs.existsSync(p)) {
        schemaSql = fs.readFileSync(p, 'utf8');
        break;
      }
    }

    if (schemaSql) {
      await connection.query(schemaSql);
      console.log('✅ Migrations applied successfully!');
    } else {
      console.log('ℹ️ Schema file already imported or not found in dist; skipping auto-migration.');
    }

    // Apply column updates to existing databases
    try {
      await connection.query(`ALTER TABLE users MODIFY COLUMN avatar_url LONGTEXT NULL;`);
      await connection.query(`ALTER TABLE user_profiles MODIFY COLUMN avatar_url LONGTEXT NULL;`);
    } catch (e) {
      // Ignore if table/column does not exist yet
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
