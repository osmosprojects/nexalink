import { query } from '../config/db';

export interface TaskRow {
  task_id: number;
  user_id: number;
  contact_id: number | null;
  goal_id: number | null;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string | null;
  completed_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  contact_name?: string;
  contact_avatar?: string;
  goal_title?: string;
}

export class TaskRepository {
  static async list(userId: number, filters: { status?: string; contact_id?: number; goal_id?: number; priority?: string } = {}) {
    const whereClauses = ['t.user_id = ?'];
    const params: any[] = [userId];

    if (filters.status && filters.status !== 'all') {
      whereClauses.push('t.status = ?');
      params.push(filters.status);
    }

    if (filters.priority && filters.priority !== 'all') {
      whereClauses.push('t.priority = ?');
      params.push(filters.priority);
    }

    if (filters.contact_id) {
      whereClauses.push('t.contact_id = ?');
      params.push(filters.contact_id);
    }

    if (filters.goal_id) {
      whereClauses.push('t.goal_id = ?');
      params.push(filters.goal_id);
    }

    return query<TaskRow[]>(
      `SELECT 
        t.*,
        CONCAT(c.first_name, ' ', c.last_name) as contact_name,
        c.avatar_url as contact_avatar,
        g.title as goal_title
       FROM tasks t
       LEFT JOIN contacts c ON t.contact_id = c.contact_id
       LEFT JOIN goals g ON t.goal_id = g.goal_id
       WHERE ${whereClauses.join(' AND ')}
       ORDER BY t.due_date ASC, t.created_at DESC`,
      params
    );
  }

  static async getById(userId: number, taskId: number): Promise<TaskRow | null> {
    const rows = await query<TaskRow[]>(
      `SELECT 
        t.*,
        CONCAT(c.first_name, ' ', c.last_name) as contact_name,
        c.avatar_url as contact_avatar,
        g.title as goal_title
       FROM tasks t
       LEFT JOIN contacts c ON t.contact_id = c.contact_id
       LEFT JOIN goals g ON t.goal_id = g.goal_id
       WHERE t.user_id = ? AND t.task_id = ?
       LIMIT 1`,
      [userId, taskId]
    );
    return rows[0] || null;
  }

  static async create(userId: number, data: Partial<TaskRow>): Promise<number> {
    const result: any = await query(
      `INSERT INTO tasks (
        user_id, contact_id, goal_id, title, description, status, priority, due_date, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        data.contact_id || null,
        data.goal_id || null,
        data.title,
        data.description || null,
        data.status || 'todo',
        data.priority || 'medium',
        data.due_date || null,
        data.sort_order ?? 0,
      ]
    );
    return result.insertId;
  }

  static async update(userId: number, taskId: number, data: Partial<TaskRow>): Promise<void> {
    const isDone = data.status === 'done';
    const completedAt = isDone ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null;

    await query(
      `UPDATE tasks SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        due_date = COALESCE(?, due_date),
        sort_order = COALESCE(?, sort_order),
        contact_id = COALESCE(?, contact_id),
        goal_id = COALESCE(?, goal_id),
        completed_at = CASE 
          WHEN ? = 'done' THEN COALESCE(completed_at, NOW())
          WHEN ? IS NOT NULL AND ? != 'done' THEN NULL
          ELSE completed_at
        END
      WHERE user_id = ? AND task_id = ?`,
      [
        data.title ?? null,
        data.description ?? null,
        data.status ?? null,
        data.priority ?? null,
        data.due_date ?? null,
        data.sort_order ?? null,
        data.contact_id ?? null,
        data.goal_id ?? null,
        data.status ?? null,
        data.status ?? null,
        data.status ?? null,
        userId,
        taskId,
      ]
    );
  }

  static async delete(userId: number, taskId: number): Promise<boolean> {
    const result: any = await query(
      `DELETE FROM tasks WHERE user_id = ? AND task_id = ?`,
      [userId, taskId]
    );
    return result.affectedRows > 0;
  }
}
