import { query } from '../config/db';

export interface UserMatchScoreRow {
  match_score_id: number;
  user_a_id: number;
  user_b_id: number;
  score: number;
  reasons: string[];
  is_mutual: boolean;
  computed_at: string;
  // Joined Candidate Profile fields
  recommended_name?: string;
  recommended_role?: string;
  recommended_company?: string;
  avatar_url?: string | null;
  industry?: string | null;
  skills?: any;
}

export class UserMatchScoreRepository {
  private static tablesChecked = false;

  static async ensureTablesExist(): Promise<void> {
    if (this.tablesChecked) return;
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS user_match_scores (
          match_score_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          user_a_id BIGINT UNSIGNED NOT NULL,
          user_b_id BIGINT UNSIGNED NOT NULL,
          score FLOAT NOT NULL DEFAULT 0,
          reasons JSON NOT NULL,
          is_mutual TINYINT(1) NOT NULL DEFAULT 0,
          computed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY uq_user_match_pair (user_a_id, user_b_id),
          KEY idx_user_a_score (user_a_id, score)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await query(`
        CREATE TABLE IF NOT EXISTS skipped_profiles (
          skip_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          user_id BIGINT UNSIGNED NOT NULL,
          skipped_user_id BIGINT UNSIGNED NOT NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY uq_user_skipped_pair (user_id, skipped_user_id),
          KEY idx_skipped_user (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      this.tablesChecked = true;
    } catch (err) {
      console.warn('⚠️ Auto table creation notice:', err);
    }
  }

  static async upsertScoreBatch(
    records: { userAId: number; userBId: number; score: number; reasons: string[]; isMutual: boolean }[]
  ): Promise<void> {
    if (records.length === 0) return;
    await this.ensureTablesExist();

    for (const rec of records) {
      try {
        await query(
          `INSERT INTO user_match_scores (user_a_id, user_b_id, score, reasons, is_mutual)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             score = VALUES(score),
             reasons = VALUES(reasons),
             is_mutual = VALUES(is_mutual),
             updated_at = NOW()`,
          [rec.userAId, rec.userBId, rec.score, JSON.stringify(rec.reasons), rec.isMutual ? 1 : 0]
        );
      } catch (err) {
        console.error('upsertScoreBatch record error:', err);
      }
    }
  }

  static async getSkippedUserIds(userId: number): Promise<number[]> {
    await this.ensureTablesExist();
    try {
      const rows = await query<{ skipped_user_id: number }[]>(
        `SELECT skipped_user_id FROM skipped_profiles WHERE user_id = ?`,
        [userId]
      );
      return rows.map((r) => r.skipped_user_id);
    } catch {
      return [];
    }
  }

  static async recordSkip(userId: number, skippedUserId: number): Promise<void> {
    await this.ensureTablesExist();
    try {
      await query(
        `INSERT INTO skipped_profiles (user_id, skipped_user_id)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE created_at = NOW()`,
        [userId, skippedUserId]
      );
    } catch (err) {
      console.error('recordSkip error:', err);
    }
  }

  static async getTopMatches(userId: number, limit = 10, offset = 0): Promise<UserMatchScoreRow[]> {
    await this.ensureTablesExist();
    try {
      const skippedIds = await this.getSkippedUserIds(userId);
      const excludeIds = [userId, ...skippedIds];

      const sql = `
        SELECT 
          ums.match_score_id, ums.user_a_id, ums.user_b_id, ums.score, ums.reasons, ums.is_mutual, ums.computed_at,
          u.display_name AS recommended_name,
          COALESCE(p.headline, 'Strategic Professional') AS recommended_role,
          COALESCE(p.company, 'NexaLink Member') AS recommended_company,
          u.avatar_url,
          p.industry,
          p.skills
        FROM user_match_scores ums
        JOIN users u ON ums.user_b_id = u.user_id
        LEFT JOIN user_profiles p ON u.user_id = p.user_id
        WHERE ums.user_a_id = ?
          AND ums.user_b_id NOT IN (${excludeIds.map(() => '?').join(',')})
          AND u.status = 'active'
        ORDER BY ums.score DESC
        LIMIT ? OFFSET ?
      `;

      const params = [userId, ...excludeIds, limit, offset];
      const rows = await query<any[]>(sql, params);

      return rows.map((r) => ({
        ...r,
        reasons: typeof r.reasons === 'string' ? JSON.parse(r.reasons) : r.reasons || [],
        skills: typeof r.skills === 'string' ? JSON.parse(r.skills) : r.skills || {},
        is_mutual: Boolean(r.is_mutual),
      }));
    } catch (err) {
      console.warn('getTopMatches error:', err);
      return [];
    }
  }

  static async getRandomDiversityMatches(userId: number, excludeUserIds: number[], limit = 1): Promise<UserMatchScoreRow[]> {
    await this.ensureTablesExist();
    try {
      const allExclude = [...new Set([userId, ...excludeUserIds])];
      const sql = `
        SELECT 
          ums.match_score_id, ums.user_a_id, ums.user_b_id, ums.score, ums.reasons, ums.is_mutual, ums.computed_at,
          u.display_name AS recommended_name,
          COALESCE(p.headline, 'Strategic Professional') AS recommended_role,
          COALESCE(p.company, 'NexaLink Member') AS recommended_company,
          u.avatar_url,
          p.industry,
          p.skills
        FROM user_match_scores ums
        JOIN users u ON ums.user_b_id = u.user_id
        LEFT JOIN user_profiles p ON u.user_id = p.user_id
        WHERE ums.user_a_id = ?
          AND ums.user_b_id NOT IN (${allExclude.map(() => '?').join(',')})
          AND u.status = 'active'
          AND ums.score BETWEEN 30 AND 65
        ORDER BY RAND()
        LIMIT ?
      `;

      const rows = await query<any[]>(sql, [userId, ...allExclude, limit]);
      return rows.map((r) => ({
        ...r,
        reasons: typeof r.reasons === 'string' ? JSON.parse(r.reasons) : r.reasons || [],
        skills: typeof r.skills === 'string' ? JSON.parse(r.skills) : r.skills || {},
        is_mutual: Boolean(r.is_mutual),
      }));
    } catch {
      return [];
    }
  }

  static async getMatchScoreForPair(userAId: number, userBId: number): Promise<number> {
    await this.ensureTablesExist();
    try {
      const rows = await query<{ score: number }[]>(
        `SELECT score FROM user_match_scores WHERE user_a_id = ? AND user_b_id = ? LIMIT 1`,
        [userAId, userBId]
      );
      return rows[0]?.score ?? 50;
    } catch {
      return 50;
    }
  }
}
