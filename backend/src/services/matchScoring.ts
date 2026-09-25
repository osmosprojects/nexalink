/**
 * matchScoring.ts - Pure Deterministic Matchmaking & Scoring Module
 * 
 * Column Mapping Notes:
 * - profile.skills (JSON) -> Profile Metadata (hobbies, interests, goals, networkingGroup, currentCity, targetCities)
 * - profile.interests (JSON) -> Connections Offered / Bridges [{ businessDomain, personName, orgName, role, city, relationship }]
 * - profile.networking_goals (JSON) -> Target Businesses & Industries ["SaaS", "FinTech", ...]
 */

const GOAL_KEYWORDS = ['invest', 'cofound', 'hire', 'fund', 'mentor', 'app', 'software', 'network', 'partner', 'lead', 'client'];

/**
 * Calculates normalized array set intersection score.
 * Case-insensitive & trimmed string comparison.
 */
export function arrayIntersectionScore(a: any[] = [], b: any[] = [], maxPoints = 10): { score: number; overlaps: string[] } {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || b.length === 0) {
    return { score: 0, overlaps: [] };
  }

  const normA = a.map((s) => String(s).trim().toLowerCase()).filter(Boolean);
  const normB = b.map((s) => String(s).trim().toLowerCase()).filter(Boolean);

  const overlaps: string[] = [];
  for (const itemA of normA) {
    for (const itemB of normB) {
      if (itemA === itemB || itemA.includes(itemB) || itemB.includes(itemA)) {
        const original = a.find((x) => String(x).toLowerCase() === itemA) || itemA;
        if (!overlaps.includes(original)) overlaps.push(original);
      }
    }
  }

  if (overlaps.length === 0) return { score: 0, overlaps: [] };

  const maxLen = Math.max(normA.length, normB.length);
  const ratio = Math.min(1, overlaps.length / Math.min(maxLen, 3));
  return { score: Math.round(ratio * maxPoints), overlaps };
}

/**
 * Evaluates Geographic Proximity Score (15% Weight / 15 Pts Max)
 */
export function matchGeography(metaA: any = {}, metaB: any = {}): { score: number; reason: string | null } {
  const cityA = String(metaA.currentCity || '').trim().toLowerCase();
  const cityB = String(metaB.currentCity || '').trim().toLowerCase();
  const targetA = (Array.isArray(metaA.targetCities) ? metaA.targetCities : []).map((c: any) => String(c).trim().toLowerCase());
  const targetB = (Array.isArray(metaB.targetCities) ? metaB.targetCities : []).map((c: any) => String(c).trim().toLowerCase());

  // 1. Exact current city match = Full points (15 pts)
  if (cityA && cityB && cityA === cityB) {
    return { score: 15, reason: `Both based in ${metaA.currentCity}` };
  }

  // 2. Candidate city in target cities = Partial points (10 pts)
  if (cityB && targetA.includes(cityB)) {
    return { score: 10, reason: `Located in your target city ${metaB.currentCity}` };
  }
  if (cityA && targetB.includes(cityA)) {
    return { score: 10, reason: `Targeting your current city ${metaA.currentCity}` };
  }

  // 3. Target cities overlap = Partial points (8 pts)
  const commonTargets = targetA.filter((tc: any) => targetB.includes(tc));
  if (commonTargets.length > 0) {
    return { score: 8, reason: `Common expansion focus in target cities` };
  }

  return { score: 0, reason: null };
}

/**
 * Free-text goal alignment fallback matching (30% Weight / 30 Pts Max)
 */
export function matchGoalsFreeText(goalsA: any[] = [], goalsB: any[] = []): { score: number; overlaps: string[] } {
  if (!goalsA.length || !goalsB.length) return { score: 0, overlaps: [] };

  const textA = goalsA.join(' ').toLowerCase();
  const textB = goalsB.join(' ').toLowerCase();

  const matchedKeywords = GOAL_KEYWORDS.filter(
    (kw) => textA.includes(kw) && textB.includes(kw)
  );

  if (matchedKeywords.length === 0) return { score: 0, overlaps: [] };

  const score = Math.min(30, matchedKeywords.length * 15);
  return { score, overlaps: matchedKeywords };
}

/**
 * Evaluates Bridges relevance: B's offered connections against A's goals (10% Weight / 10 Pts Max)
 */
export function matchBridgeRelevance(goalsA: any[] = [], bridgesB: any[] = []): { score: number; reasons: string[] } {
  if (!goalsA.length || !Array.isArray(bridgesB) || bridgesB.length === 0) {
    return { score: 0, reasons: [] };
  }

  const goalsText = goalsA.join(' ').toLowerCase();
  let points = 0;
  const reasons: string[] = [];

  for (const bridge of bridgesB) {
    const domain = String(bridge.businessDomain || bridge.domain || '').toLowerCase();
    const role = String(bridge.role || bridge.designation || '').toLowerCase();

    if (domain && goalsText.includes(domain)) {
      points += 5;
      reasons.push(`Offers warm connection in ${bridge.businessDomain || bridge.domain}`);
    } else if (role && goalsText.includes(role)) {
      points += 5;
      reasons.push(`Can introduce ${bridge.personName || 'Executive'} (${bridge.role})`);
    }
  }

  return { score: Math.min(10, points), reasons };
}

/**
 * Profile Completeness & Health Score (5% Weight / 5 Pts Max)
 */
export function profileHealthScore(user: any = {}): number {
  let score = 5;

  if (!user.bio || String(user.bio).trim().length < 15) score -= 1;
  if (!user.avatar_url) score -= 1;
  if (!user.headline) score -= 1;
  if (!user.job_title) score -= 1;
  if (!user.company) score -= 1;

  return Math.max(0, score);
}

/**
 * Pure Deterministic Match Scoring Function (0 - 100 Pts)
 * 
 * @param userA - Logged-in / Source User Profile Object
 * @param userB - Candidate User Profile Object
 * @returns { userId, score, reasons }
 */
export function calculateMatchScore(userA: any = {}, userB: any = {}): { userId: number; score: number; reasons: string[] } {
  const metaA = typeof userA.skills === 'string' ? JSON.parse(userA.skills) : userA.skills || {};
  const metaB = typeof userB.skills === 'string' ? JSON.parse(userB.skills) : userB.skills || {};

  const bridgesA = typeof userA.interests === 'string' ? JSON.parse(userA.interests) : userA.interests || [];
  const bridgesB = typeof userB.interests === 'string' ? JSON.parse(userB.interests) : userB.interests || [];

  const targetBizA = typeof userA.networking_goals === 'string' ? JSON.parse(userA.networking_goals) : userA.networking_goals || [];
  const targetBizB = typeof userB.networking_goals === 'string' ? JSON.parse(userB.networking_goals) : userB.networking_goals || [];

  const goalsA = Array.isArray(metaA.goals) ? metaA.goals : [];
  const goalsB = Array.isArray(metaB.goals) ? metaB.goals : [];

  const reasons: string[] = [];
  let totalScore = 0;

  // 1. Intent / Goal Alignment (30% / 30 Pts Max)
  const goalResult = matchGoalsFreeText(goalsA, goalsB);
  totalScore += goalResult.score;
  if (goalResult.overlaps.length > 0) {
    reasons.push(`Mutual networking focus on ${goalResult.overlaps.slice(0, 2).join(' & ')}`);
  }

  // 2. Interest + Target Business Overlap (20% / 20 Pts Max: 12pts interests, 8pts target businesses)
  const interestResult = arrayIntersectionScore(metaA.interests, metaB.interests, 12);
  const targetBizResult = arrayIntersectionScore(targetBizA, targetBizB, 8);
  totalScore += interestResult.score + targetBizResult.score;

  if (interestResult.overlaps.length > 0) {
    reasons.push(`Shared interests in ${interestResult.overlaps.slice(0, 2).join(', ')}`);
  }
  if (targetBizResult.overlaps.length > 0) {
    reasons.push(`Same target industry focus (${targetBizResult.overlaps[0]})`);
  }

  // 3. Geography Match (15% / 15 Pts Max)
  const geoResult = matchGeography(metaA, metaB);
  totalScore += geoResult.score;
  if (geoResult.reason) reasons.push(geoResult.reason);

  // 4. Shared Networking Groups (15% / 15 Pts Max)
  const groupResult = arrayIntersectionScore(metaA.networkingGroup, metaB.networkingGroup, 15);
  totalScore += groupResult.score;
  if (groupResult.overlaps.length > 0) {
    reasons.push(`Shared membership in ${groupResult.overlaps[0]}`);
  }

  // 5. Bridges Relevance (10% / 10 Pts Max)
  const bridgeResult = matchBridgeRelevance(goalsA, bridgesB);
  totalScore += bridgeResult.score;
  reasons.push(...bridgeResult.reasons);

  // 6. Hobbies Overlap (5% / 5 Pts Max)
  const hobbyResult = arrayIntersectionScore(metaA.hobbies, metaB.hobbies, 5);
  totalScore += hobbyResult.score;
  if (hobbyResult.overlaps.length > 0) {
    reasons.push(`Mutual hobby in ${hobbyResult.overlaps[0]}`);
  }

  // 7. Profile Completeness (5% / 5 Pts Max)
  const healthPts = profileHealthScore(userB);
  totalScore += healthPts;

  // Fallback reason if zero overlap detected
  if (reasons.length === 0) {
    reasons.push('Shared professional ecosystem identity');
  }

  const finalScore = Math.min(100, Math.max(0, totalScore));

  return {
    userId: userB.user_id || userB.userId,
    score: finalScore,
    reasons: [...new Set(reasons)],
  };
}

export default {
  calculateMatchScore,
  arrayIntersectionScore,
  matchGeography,
  matchGoalsFreeText,
  matchBridgeRelevance,
  profileHealthScore,
};
