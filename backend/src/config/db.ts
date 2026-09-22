import mysql from 'mysql2/promise';
import { config } from './env';

export const pool = mysql.createPool(config.db);

export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const [rows] = await pool.execute(sql, params);
  return rows as T;
}

export async function withTransaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();

    // Ensure avatar_url column can hold Base64 image data without truncation
    try {
      await connection.query(`ALTER TABLE users MODIFY COLUMN avatar_url LONGTEXT NULL`);
      await connection.query(`ALTER TABLE user_profiles MODIFY COLUMN avatar_url LONGTEXT NULL`);
    } catch {
      // Ignore if table/column does not exist yet or already altered
    }

    connection.release();
    console.log('✅ Connected to MySQL Database:', config.db.database);
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MySQL Database:', error);
    return false;
  }
}
