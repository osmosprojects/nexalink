import { query } from '../config/db';

export interface MeetingRow {
  meeting_id: number;
  user_id: number;
  contact_id: number | null;
  goal_id: number | null;
  title: string;
  meeting_type: 'coffee' | 'video' | 'office' | 'conference' | 'phone' | 'other';
  start_at: string;
  end_at: string;
  location: string | null;
  meeting_url: string | null;
  agenda: string | null;
  outcome: string | null;
  notes: string | null;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
  contact_name?: string;
  contact_avatar?: string;
  goal_title?: string;
}

export class MeetingRepository {
  static async list(userId: number, filters: { contact_id?: number; upcoming_only?: boolean; limit?: number } = {}) {
    const whereClauses: string[] = ['m.user_id = ?'];
    const params: any[] = [userId];

    if (filters.contact_id) {
      whereClauses.push('m.contact_id = ?');
      params.push(filters.contact_id);
    }

    if (filters.upcoming_only) {
      whereClauses.push('m.start_at >= NOW()');
    }

    const whereSql = whereClauses.join(' AND ');
    const limit = filters.limit ? `LIMIT ${Number(filters.limit)}` : '';

    return query<MeetingRow[]>(
      `SELECT 
        m.*,
        CONCAT(c.first_name, ' ', c.last_name) as contact_name,
        c.avatar_url as contact_avatar,
        g.title as goal_title
       FROM meetings m
       LEFT JOIN contacts c ON m.contact_id = c.contact_id
       LEFT JOIN goals g ON m.goal_id = g.goal_id
       WHERE ${whereSql}
       ORDER BY m.start_at ASC
       ${limit}`,
      params
    );
  }

  static async getById(userId: number, meetingId: number): Promise<MeetingRow | null> {
    const rows = await query<MeetingRow[]>(
      `SELECT 
        m.*,
        CONCAT(c.first_name, ' ', c.last_name) as contact_name,
        c.avatar_url as contact_avatar,
        g.title as goal_title
       FROM meetings m
       LEFT JOIN contacts c ON m.contact_id = c.contact_id
       LEFT JOIN goals g ON m.goal_id = g.goal_id
       WHERE m.user_id = ? AND m.meeting_id = ?
       LIMIT 1`,
      [userId, meetingId]
    );
    return rows[0] || null;
  }

  static async create(userId: number, data: Partial<MeetingRow>): Promise<number> {
    const result: any = await query(
      `INSERT INTO meetings (
        user_id, contact_id, goal_id, title, meeting_type, start_at, end_at, location, meeting_url, agenda, outcome, notes, follow_up_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        data.contact_id || null,
        data.goal_id || null,
        data.title || 'Untitled Meeting',
        data.meeting_type || 'video',
        data.start_at,
        data.end_at,
        data.location || null,
        data.meeting_url || null,
        data.agenda || null,
        data.outcome || null,
        data.notes || null,
        data.follow_up_date || null,
      ]
    );
    return result.insertId;
  }

  static async update(userId: number, meetingId: number, data: Partial<MeetingRow>): Promise<void> {
    await query(
      `UPDATE meetings SET
        title = COALESCE(?, title),
        contact_id = COALESCE(?, contact_id),
        goal_id = COALESCE(?, goal_id),
        meeting_type = COALESCE(?, meeting_type),
        start_at = COALESCE(?, start_at),
        end_at = COALESCE(?, end_at),
        location = COALESCE(?, location),
        meeting_url = COALESCE(?, meeting_url),
        agenda = COALESCE(?, agenda),
        outcome = COALESCE(?, outcome),
        notes = COALESCE(?, notes),
        follow_up_date = COALESCE(?, follow_up_date)
      WHERE user_id = ? AND meeting_id = ?`,
      [
        data.title ?? null,
        data.contact_id ?? null,
        data.goal_id ?? null,
        data.meeting_type ?? null,
        data.start_at ?? null,
        data.end_at ?? null,
        data.location ?? null,
        data.meeting_url ?? null,
        data.agenda ?? null,
        data.outcome ?? null,
        data.notes ?? null,
        data.follow_up_date ?? null,
        userId,
        meetingId,
      ]
    );
  }

  static async delete(userId: number, meetingId: number): Promise<boolean> {
    const result: any = await query(
      `DELETE FROM meetings WHERE user_id = ? AND meeting_id = ?`,
      [userId, meetingId]
    );
    return result.affectedRows > 0;
  }
}
