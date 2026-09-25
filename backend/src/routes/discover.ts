import { Router, Request, Response, NextFunction } from 'express';
import { query } from '../config/db';
import { runMatchmakingPrecomputation } from '../jobs/matchmakingCron';

const router = Router();

/**
 * GET /api/discover
 * Fetches top N precomputed matches for logged-in user.
 * Excludes skipped profiles and includes 1-in-5 Diversity Injection.
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const limit = parseInt(String(req.query.limit || '10'), 10);
    const offset = parseInt(String(req.query.offset || '0'), 10);

    // 1. Fetch skipped profile IDs
    const skippedRows = await query<any[]>(
      `SELECT skipped_user_id FROM skipped_profiles WHERE user_id = ?`,
      [userId]
    );
    const skippedUserIds = skippedRows.map((r) => r.skipped_user_id);
    const excludeIds = [userId, ...skippedUserIds];

    // 2. Query top matches from match_scores
    let matches = await query<any[]>(
      `SELECT 
         ms.userB_id AS user_id,
         ms.score,
         ms.reasons,
         u.display_name,
         u.avatar_url,
         COALESCE(p.headline, 'Strategic Professional') AS headline,
         COALESCE(p.company, 'NexaLink Member') AS company,
         p.industry,
         p.skills
       FROM match_scores ms
       JOIN users u ON ms.userB_id = u.user_id
       LEFT JOIN user_profiles p ON u.user_id = p.user_id
       WHERE ms.userA_id = ?
         AND ms.userB_id NOT IN (${excludeIds.map(() => '?').join(',')})
         AND u.status = 'active'
       ORDER BY ms.score DESC
       LIMIT ? OFFSET ?`,
      [userId, ...excludeIds, limit, offset]
    );

    // Dynamic fallback if no precomputed scores exist yet
    if (matches.length === 0) {
      await runMatchmakingPrecomputation();
      matches = await query<any[]>(
        `SELECT 
           ms.userB_id AS user_id,
           ms.score,
           ms.reasons,
           u.display_name,
           u.avatar_url,
           COALESCE(p.headline, 'Strategic Professional') AS headline,
           COALESCE(p.company, 'NexaLink Member') AS company,
           p.industry,
           p.skills
         FROM match_scores ms
         JOIN users u ON ms.userB_id = u.user_id
         LEFT JOIN user_profiles p ON u.user_id = p.user_id
         WHERE ms.userA_id = ?
           AND ms.userB_id NOT IN (${excludeIds.map(() => '?').join(',')})
           AND u.status = 'active'
         ORDER BY ms.score DESC
         LIMIT ? OFFSET ?`,
        [userId, ...excludeIds, limit, offset]
      );
    }

    // Parse reasons JSON arrays & skills JSON
    const parsedMatches = matches.map((m) => ({
      ...m,
      reasons: typeof m.reasons === 'string' ? JSON.parse(m.reasons) : m.reasons || [],
      skills: typeof m.skills === 'string' ? JSON.parse(m.skills) : m.skills || {},
    }));

    // 3. Diversity Injection (1 out of every 5 results replaced by lower-scored/random profile)
    const finalFeed = [...parsedMatches];
    const topIds = parsedMatches.map((m) => m.user_id);

    for (let i = 4; i < finalFeed.length; i += 5) {
      const diversityExclude = [...new Set([...excludeIds, ...topIds])];
      const randomLower = await query<any[]>(
        `SELECT 
           ms.userB_id AS user_id,
           ms.score,
           ms.reasons,
           u.display_name,
           u.avatar_url,
           COALESCE(p.headline, 'Strategic Professional') AS headline,
           COALESCE(p.company, 'NexaLink Member') AS company,
           p.industry,
           p.skills
         FROM match_scores ms
         JOIN users u ON ms.userB_id = u.user_id
         LEFT JOIN user_profiles p ON u.user_id = p.user_id
         WHERE ms.userA_id = ?
           AND ms.userB_id NOT IN (${diversityExclude.map(() => '?').join(',')})
           AND u.status = 'active'
           AND ms.score BETWEEN 30 AND 65
         ORDER BY RAND()
         LIMIT 1`,
        [userId, ...diversityExclude]
      );

      if (randomLower && randomLower.length > 0) {
        const item = randomLower[0];
        item.reasons = typeof item.reasons === 'string' ? JSON.parse(item.reasons) : item.reasons || [];
        item.reasons.unshift('💡 Diversity Spotlight Recommendation');
        finalFeed[i] = item;
        topIds.push(item.user_id);
      }
    }

    return res.json({
      success: true,
      data: finalFeed,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/discover/skip/:userId
 * Dismisses candidate profile for fatigue handling.
 */
router.post('/skip/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const skippedUserId = parseInt(String(req.params.userId), 10);

    if (!skippedUserId || isNaN(skippedUserId)) {
      return res.status(400).json({ success: false, message: 'Valid target userId required' });
    }

    await query(
      `INSERT INTO skipped_profiles (user_id, skipped_user_id, skipped_at)
       VALUES (?, ?, NOW())
       ON DUPLICATE KEY UPDATE skipped_at = NOW()`,
      [userId, skippedUserId]
    );

    return res.json({
      success: true,
      message: 'Profile dismissed from discover feed',
    });
  } catch (err) {
    next(err);
  }
});

export default router;
