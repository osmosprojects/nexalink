import { query } from '../config/db';

export interface TagRow {
  tag_id: number;
  user_id: number;
  name: string;
  color: string;
  created_at: string;
}

export class TagRepository {
  static async listByUserId(userId: number): Promise<TagRow[]> {
    return query<TagRow[]>(
      `SELECT tag_id, user_id, name, color, created_at FROM tags WHERE user_id = ? ORDER BY name ASC`,
      [userId]
    );
  }

  static async findOrCreate(userId: number, name: string, color = '#2563EB'): Promise<number> {
    const existing = await query<TagRow[]>(
      `SELECT tag_id FROM tags WHERE user_id = ? AND name = ? LIMIT 1`,
      [userId, name.trim()]
    );
    if (existing.length > 0) {
      return existing[0].tag_id;
    }
    const result: any = await query(
      `INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?)`,
      [userId, name.trim(), color]
    );
    return result.insertId;
  }
}
