import { query } from '../config/db';

export interface RecommendationRow {
  recommendation_id: number;
  user_id: number;
  contact_id: number | null;
  recommended_name: string;
  recommended_role: string;
  recommended_company: string;
  avatar_url: string | null;
  industry: string | null;
  skills: any;
  reason: string;
  score: number;
  status: 'pending' | 'connected' | 'saved' | 'dismissed';
  created_at: string;
}

export class RecommendationRepository {
  static async list(userId: number, status = 'pending'): Promise<RecommendationRow[]> {
    const rows = await query<any[]>(
      `SELECT * FROM recommendations WHERE user_id = ? AND status = ? ORDER BY score DESC, created_at DESC`,
      [userId, status]
    );

    return rows.map((r) => ({
      ...r,
      skills: typeof r.skills === 'string' ? JSON.parse(r.skills) : r.skills || [],
    }));
  }

  static async updateStatus(userId: number, recommendationId: number, status: string): Promise<void> {
    await query(
      `UPDATE recommendations SET status = ? WHERE user_id = ? AND recommendation_id = ?`,
      [status, userId, recommendationId]
    );
  }
}
