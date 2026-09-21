import { query, withTransaction } from '../config/db';

export interface GoalRow {
  goal_id: number;
  user_id: number;
  title: string;
  description: string | null;
  goal_type: string;
  target_value: number;
  current_value: number;
  unit: string;
  start_date: string | null;
  end_date: string | null;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  created_at: string;
  updated_at: string;
  progress_percentage?: number;
  recent_progress?: GoalProgressRow[];
}

export interface GoalProgressRow {
  progress_id: number;
  goal_id: number;
  progress_date: string;
  progress_value: number;
  notes: string | null;
  created_at: string;
}

export class GoalRepository {
  static async list(userId: number, status?: string): Promise<GoalRow[]> {
    const whereClauses = ['user_id = ?'];
    const params: any[] = [userId];

    if (status && status !== 'all') {
      whereClauses.push('status = ?');
      params.push(status);
    }

    const rows = await query<GoalRow[]>(
      `SELECT * FROM goals WHERE ${whereClauses.join(' AND ')} ORDER BY created_at DESC`,
      params
    );

    return rows.map((g) => ({
      ...g,
      progress_percentage: g.target_value > 0 ? Math.min(100, Math.round((g.current_value / g.target_value) * 100)) : 0,
    }));
  }

  static async getById(userId: number, goalId: number): Promise<GoalRow | null> {
    const rows = await query<GoalRow[]>(
      `SELECT * FROM goals WHERE user_id = ? AND goal_id = ? LIMIT 1`,
      [userId, goalId]
    );
    if (!rows[0]) return null;

    const progress = await query<GoalProgressRow[]>(
      `SELECT * FROM goal_progress WHERE goal_id = ? ORDER BY progress_date DESC, created_at DESC`,
      [goalId]
    );

    const goal = rows[0];
    return {
      ...goal,
      progress_percentage: goal.target_value > 0 ? Math.min(100, Math.round((goal.current_value / goal.target_value) * 100)) : 0,
      recent_progress: progress,
    };
  }

  static async create(userId: number, data: Partial<GoalRow>): Promise<number> {
    const result: any = await query(
      `INSERT INTO goals (
        user_id, title, description, goal_type, target_value, current_value, unit, start_date, end_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        data.title,
        data.description || null,
        data.goal_type || 'connections',
        data.target_value || 10,
        data.current_value || 0,
        data.unit || 'people',
        data.start_date || null,
        data.end_date || null,
        data.status || 'active',
      ]
    );
    return result.insertId;
  }

  static async update(userId: number, goalId: number, data: Partial<GoalRow>): Promise<void> {
    await query(
      `UPDATE goals SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        goal_type = COALESCE(?, goal_type),
        target_value = COALESCE(?, target_value),
        current_value = COALESCE(?, current_value),
        unit = COALESCE(?, unit),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        status = COALESCE(?, status)
      WHERE user_id = ? AND goal_id = ?`,
      [
        data.title ?? null,
        data.description ?? null,
        data.goal_type ?? null,
        data.target_value ?? null,
        data.current_value ?? null,
        data.unit ?? null,
        data.start_date ?? null,
        data.end_date ?? null,
        data.status ?? null,
        userId,
        goalId,
      ]
    );
  }

  static async logProgress(userId: number, goalId: number, data: { increment_value?: number; progress_value?: number; notes?: string }): Promise<void> {
    return withTransaction(async (conn) => {
      const increment = data.increment_value || 1;
      
      // Check goal ownership
      const [gRows]: any = await conn.execute(
        `SELECT goal_id, current_value, target_value FROM goals WHERE user_id = ? AND goal_id = ? LIMIT 1`,
        [userId, goalId]
      );
      if (!gRows[0]) throw new Error('Goal not found or permission denied');

      const newCurrent = Math.max(0, gRows[0].current_value + increment);
      const isCompleted = newCurrent >= gRows[0].target_value;

      await conn.execute(
        `UPDATE goals 
         SET current_value = ?, 
             status = CASE WHEN ? = 1 THEN 'completed' ELSE status END
         WHERE goal_id = ?`,
        [newCurrent, isCompleted ? 1 : 0, goalId]
      );

      await conn.execute(
        `INSERT INTO goal_progress (goal_id, progress_date, progress_value, notes)
         VALUES (?, CURDATE(), ?, ?)`,
        [goalId, increment, data.notes || 'Progress updated']
      );
    });
  }

  static async delete(userId: number, goalId: number): Promise<boolean> {
    const result: any = await query(
      `DELETE FROM goals WHERE user_id = ? AND goal_id = ?`,
      [userId, goalId]
    );
    return result.affectedRows > 0;
  }
}
