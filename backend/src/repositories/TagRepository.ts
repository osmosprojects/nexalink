import { query, withTransaction } from '../config/db';

export interface TagRow {
  tag_id: number;
  user_id: number;
  name: string;
  color: string;
  created_at: string;
}

export class TagRepository {
  static WARMTH_TAGS = [
    { name: '🔥 Hot', color: '#EF4444' },
    { name: '☀️ Warm', color: '#F59E0B' },
    { name: '❄️ Cold', color: '#3B82F6' },
  ];

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

  /**
   * Automatically calculates and synchronizes Hot, Warm, and Cold relationship tags
   * based on interaction recency and frequency.
   */
  static async syncContactWarmth(userId: number, contactId?: number): Promise<void> {
    try {
      // 1. Ensure all 3 warmth tags exist for this user
      const hotTagId = await this.findOrCreate(userId, '🔥 Hot', '#EF4444');
      const warmTagId = await this.findOrCreate(userId, '☀️ Warm', '#F59E0B');
      const coldTagId = await this.findOrCreate(userId, '❄️ Cold', '#3B82F6');
      const warmthTagIds = [hotTagId, warmTagId, coldTagId];

      // 2. Query target contacts
      const contactWhere = contactId ? 'AND c.contact_id = ?' : '';
      const params = contactId ? [userId, contactId] : [userId];

      const contacts = await query<any[]>(
        `SELECT 
          c.contact_id,
          c.last_interaction_at,
          c.relationship_strength,
          COUNT(i.interaction_id) as recent_interactions_count,
          MAX(i.interaction_date) as latest_interaction_date
        FROM contacts c
        LEFT JOIN interactions i ON c.contact_id = i.contact_id AND i.interaction_date >= DATE_SUB(NOW(), INTERVAL 60 DAY)
        WHERE c.user_id = ? ${contactWhere}
        GROUP BY c.contact_id`,
        params
      );

      const now = new Date().getTime();

      for (const c of contacts) {
        const lastDate = c.latest_interaction_at || c.last_interaction_at;
        let daysSinceLast = 999;
        if (lastDate) {
          const d = new Date(lastDate).getTime();
          if (!isNaN(d)) {
            daysSinceLast = Math.max(0, Math.floor((now - d) / (1000 * 60 * 60 * 24)));
          }
        }

        const recentCount = Number(c.recent_interactions_count || 0);

        // Warmth Logic:
        // Hot: Interacted within 14 days OR 3+ interactions in last 60 days
        // Warm: Interacted within 15-45 days OR 1-2 interactions in last 60 days
        // Cold: No interactions in 45+ days or never interacted
        let targetTagId = coldTagId;
        if (daysSinceLast <= 14 || recentCount >= 3) {
          targetTagId = hotTagId;
        } else if (daysSinceLast <= 45 || recentCount >= 1) {
          targetTagId = warmTagId;
        }

        // Delete existing warmth tags from this contact
        await query(
          `DELETE FROM contact_tags 
           WHERE contact_id = ? AND tag_id IN (?, ?, ?)`,
          [c.contact_id, hotTagId, warmTagId, coldTagId]
        );

        // Assign calculated warmth tag
        await query(
          `INSERT IGNORE INTO contact_tags (contact_id, tag_id) VALUES (?, ?)`,
          [c.contact_id, targetTagId]
        );
      }
    } catch (err) {
      console.error('Failed to sync contact warmth tags:', err);
    }
  }
}
