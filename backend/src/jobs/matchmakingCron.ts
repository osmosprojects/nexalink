import { query } from '../config/db';
import { calculateMatchScore } from '../services/matchScoring';

let cron: any = null;
try {
  cron = require('node-cron');
} catch (e) {
  console.warn('⚠️ node-cron optional module warning:', e);
}

/**
 * Runs pairwise precomputation for all active profiles.
 * Includes async chunking to prevent blocking the event loop on large datasets.
 */
export async function runMatchmakingPrecomputation(): Promise<void> {
  console.log('⚡ Starting background matchmaking precomputation cron job...');

  try {
    // 1. Fetch all active user profiles
    const profiles = await query<any[]>(`
      SELECT u.user_id, u.display_name, u.avatar_url,
             p.bio, p.headline, p.company, p.job_title, p.skills, p.interests, p.networking_goals
      FROM users u
      JOIN user_profiles p ON u.user_id = p.user_id
      WHERE u.status = 'active'
    `);

    const totalUsers = profiles.length;
    if (totalUsers < 2) {
      console.log('⚠️ Insufficient users for matchmaking calculation.');
      return;
    }

    const scoresMap = new Map<string, { userA_id: number; userB_id: number; score: number; reasons: string[] }>();

    // 2. Pairwise scoring with non-blocking async chunking
    for (let i = 0; i < totalUsers; i++) {
      const userA = profiles[i];

      for (let j = 0; j < totalUsers; j++) {
        if (i === j) continue;
        const userB = profiles[j];

        const matchAtoB = calculateMatchScore(userA, userB);
        const pairKey = `${userA.user_id}_${userB.user_id}`;

        scoresMap.set(pairKey, {
          userA_id: userA.user_id,
          userB_id: userB.user_id,
          score: matchAtoB.score,
          reasons: matchAtoB.reasons,
        });
      }

      // Yield event loop every 10 users to maintain server responsiveness
      if (i % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 5));
      }
    }

    // 3. Mutual Match Bonus Pass (+10 pts if reciprocal score is high)
    for (const [pairKey, item] of scoresMap.entries()) {
      const reciprocalKey = `${item.userB_id}_${item.userA_id}`;
      const reciprocalItem = scoresMap.get(reciprocalKey);

      if (reciprocalItem && item.score >= 60 && reciprocalItem.score >= 60) {
        item.score = Math.min(100, item.score + 10);
        if (!item.reasons.some((r) => r.includes('Mutual Synergy'))) {
          item.reasons.unshift('⭐ High Mutual Synergy Match (+10 Bonus)');
        }
      }
    }

    // 4. Batch Upsert into match_scores table
    const allRecords = Array.from(scoresMap.values());
    const BATCH_SIZE = 100;

    for (let i = 0; i < allRecords.length; i += BATCH_SIZE) {
      const batch = allRecords.slice(i, i + BATCH_SIZE);

      for (const rec of batch) {
        await query(
          `INSERT INTO match_scores (userA_id, userB_id, score, reasons, computed_at)
           VALUES (?, ?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE
             score = VALUES(score),
             reasons = VALUES(reasons),
             computed_at = NOW()`,
          [rec.userA_id, rec.userB_id, rec.score, JSON.stringify(rec.reasons)]
        );
      }
    }

    console.log(`✅ Completed precomputing ${allRecords.length} match pairs for ${totalUsers} users.`);
  } catch (err) {
    console.error('❌ Matchmaking precomputation cron error:', err);
  }
}

/**
 * Schedule cron job to run every 4 hours (0 every 4 hours)
 */
export function initMatchmakingCron(): void {
  console.log('⏰ Initializing Matchmaking Cron Scheduler (Every 4 Hours)');
  try {
    if (cron && typeof cron.schedule === 'function') {
      cron.schedule('0 */4 * * *', () => {
        runMatchmakingPrecomputation();
      });
    } else {
      console.warn('⚠️ node-cron not available; skipping cron scheduler initialization.');
    }
  } catch (err) {
    console.warn('⚠️ Matchmaking cron scheduling notice:', err);
  }
}

export default {
  runMatchmakingPrecomputation,
  initMatchmakingCron,
};
