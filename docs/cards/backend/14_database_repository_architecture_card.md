# Backend Card: Database & Repository Architecture Card

## 1. Overview
The database layer in NexaLink CRM is strictly **SQL-First**: there is no ORM (no Prisma, no Sequelize, no TypeORM). Every database query executes directly through `mysql2/promise` with prepared statements, guaranteeing raw performance, predictable indexing, and complete control over transactional integrity.

- **Primary Source Files:**
  - Database Config & Pool: `backend/src/config/db.ts`
  - Migration Engine: `backend/src/database/migrate.ts`
  - Schema DDL: `backend/src/database/schema.sql`
  - Seed Engine: `backend/src/database/seed.ts`

---

## 2. Connection Pool Architecture

```typescript
// backend/src/config/db.ts
import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});
```

---

## 3. Query & Transaction Wrappers

### A. Parameterized Prepared Statements
```typescript
export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const [results] = await pool.execute(sql, params);
  return results as T;
}
```

### B. Transaction Wrapper with Guaranteed Rollback
```typescript
export async function withTransaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}
```

---

## 4. Key Engineering Standards
1. **Zero SQL Injection Risk:** All external inputs are passed as positional parameters (`?`) to `connection.execute`.
2. **ACID Compliance:** All multi-table updates (e.g. creating an interaction while updating contact health and tasks) run inside `withTransaction`.
3. **Connection Leak Prevention:** Connections obtained via `pool.getConnection()` are guaranteed to be returned to the pool in a `finally` block.
