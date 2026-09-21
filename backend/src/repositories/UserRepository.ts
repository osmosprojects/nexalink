import { query } from '../config/db';

export interface UserRow {
  user_id: number;
  email: string;
  password_hash: string | null;
  display_name: string;
  avatar_url: string | null;
  status: 'active' | 'inactive' | 'blocked';
  created_at: string;
  updated_at: string;
}

export class UserRepository {
  static async findByEmail(email: string): Promise<UserRow | null> {
    const rows = await query<UserRow[]>(
      `SELECT user_id, email, password_hash, display_name, avatar_url, status, created_at, updated_at
       FROM users WHERE email = ? LIMIT 1`,
      [email.toLowerCase().trim()]
    );
    return rows[0] || null;
  }

  static async findById(userId: number): Promise<UserRow | null> {
    const rows = await query<UserRow[]>(
      `SELECT user_id, email, password_hash, display_name, avatar_url, status, created_at, updated_at
       FROM users WHERE user_id = ? LIMIT 1`,
      [userId]
    );
    return rows[0] || null;
  }

  static async create(data: {
    email: string;
    passwordHash: string | null;
    displayName: string;
    avatarUrl?: string | null;
  }): Promise<number> {
    const result: any = await query(
      `INSERT INTO users (email, password_hash, display_name, avatar_url)
       VALUES (?, ?, ?, ?)`,
      [data.email.toLowerCase().trim(), data.passwordHash, data.displayName, data.avatarUrl || null]
    );
    return result.insertId;
  }

  static async updateAvatar(userId: number, avatarUrl: string): Promise<void> {
    await query(`UPDATE users SET avatar_url = ? WHERE user_id = ?`, [avatarUrl, userId]);
  }
}
