"use strict";
/**
 * matchScoring.ts - Pure Deterministic Matchmaking & Scoring Module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayIntersectionScore = arrayIntersectionScore;
exports.matchGeography = matchGeography;
exports.matchGoalsFreeText = matchGoalsFreeText;
exports.matchBridgeRelevance = matchBridgeRelevance;
exports.profileHealthScore = profileHealthScore;
exports.calculateMatchScore = calculateMatchScore;
const GOAL_KEYWORDS = ['invest', 'cofound', 'hire', 'fund', 'mentor', 'app', 'software', 'network', 'partner', 'lead', 'client'];
/**
 * Calculates normalized array set intersection score.
 * Case-insensitive & trimmed string comparison.
 */
function arrayIntersectionScore(a = [], b = [], maxPoints = 10) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || b.length === 0) {
        return { score: 0, overlaps: [] };
    }
    const normA = a.map((s) => String(s).trim().toLowerCase()).filter(Boolean);
    const normB = b.map((s) => String(s).trim().toLowerCase()).filter(Boolean);
    const overlaps = [];
    for (const itemA of normA) {
        for (const itemB of normB) {
            if (itemA === itemB || itemA.includes(itemB) || itemB.includes(itemA)) {
                const original = a.find((x) => String(x).toLowerCase() === itemA) || itemA;
                if (!overlaps.includes(original))
                    overlaps.push(original);
            }
        }
    }
    if (overlaps.length === 0)
        return { score: 0, overlaps: [] };
    const maxLen = Math.max(normA.length, normB.length);
    const ratio = Math.min(1, overlaps.length / Math.min(maxLen, 3));
    return { score: Math.round(ratio * maxPoints), overlaps };
}
/**
 * Evaluates Geographic Proximity Score (15% Weight / 15 Pts Max)
 */
function matchGeography(metaA = {}, metaB = {}) {
    const cityA = String(metaA.currentCity || '').trim().toLowerCase();
    const cityB = String(metaB.currentCity || '').trim().toLowerCase();
    const targetA = (Array.isArray(metaA.targetCities) ? metaA.targetCities : []).map((c) => String(c).trim().toLowerCase());
    const targetB = (Array.isArray(metaB.targetCities) ? metaB.targetCities : []).map((c) => String(c).trim().toLowerCase());
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
    const commonTargets = targetA.filter((tc) => targetB.includes(tc));
    if (commonTargets.length > 0) {
        return { score: 8, reason: `Common expansion focus in target cities` };
    }
    return { score: 0, reason: null };
}
/**
 * Free-text goal alignment fallback matching (30% Weight / 30 Pts Max)
 */
function matchGoalsFreeText(goalsA = [], goalsB = []) {
    if (!goalsA.length || !goalsB.length)
        return { score: 0, overlaps: [] };
    const textA = goalsA.join(' ').toLowerCase();
    const textB = goalsB.join(' ').toLowerCase();
    const matchedKeywords = GOAL_KEYWORDS.filter((kw) => textA.includes(kw) && textB.includes(kw));
    if (matchedKeywords.length === 0)
        return { score: 0, overlaps: [] };
    const score = Math.min(30, matchedKeywords.length * 15);
    return { score, overlaps: matchedKeywords };
}
/**
 * Evaluates Bridges relevance: B's offered connections against A's goals (10% Weight / 10 Pts Max)
 */
function matchBridgeRelevance(goalsA = [], bridgesB = []) {
    if (!goalsA.length || !Array.isArray(bridgesB) || bridgesB.length === 0) {
        return { score: 0, reasons: [] };
    }
    const goalsText = goalsA.join(' ').toLowerCase();
    let points = 0;
    const reasons = [];
    for (const bridge of bridgesB) {
        const domain = String(bridge.businessDomain || bridge.domain || '').toLowerCase();
        const role = String(bridge.role || bridge.designation || '').toLowerCase();
        if (domain && goalsText.includes(domain)) {
            points += 5;
            reasons.push(`Offers warm connection in ${bridge.businessDomain || bridge.domain}`);
        }
        else if (role && goalsText.includes(role)) {
            points += 5;
            reasons.push(`Can introduce ${bridge.personName || 'Executive'} (${bridge.role})`);
        }
    }
    return { score: Math.min(10, points), reasons };
}
/**
 * Profile Completeness & Health Score (5% Weight / 5 Pts Max)
 */
function profileHealthScore(user = {}) {
    let score = 5;
    if (!user.bio || String(user.bio).trim().length < 15)
        score -= 1;
    if (!user.avatar_url)
        score -= 1;
    if (!user.headline)
        score -= 1;
    if (!user.job_title)
        score -= 1;
    if (!user.company)
        score -= 1;
    return Math.max(0, score);
}
/**
 * Pure Deterministic Match Scoring Function (0 - 100 Pts)
 *
 * @param userA - Logged-in / Source User Profile Object
 * @param userB - Candidate User Profile Object
 * @returns { userId, score, reasons }
 */
function calculateMatchScore(userA = {}, userB = {}) {
    const metaA = typeof userA.skills === 'string' ? JSON.parse(userA.skills) : userA.skills || {};
    const metaB = typeof userB.skills === 'string' ? JSON.parse(userB.skills) : userB.skills || {};
    const rawBridgesA = typeof userA.interests === 'string' ? JSON.parse(userA.interests) : userA.interests || [];
    const rawBridgesB = typeof userB.interests === 'string' ? JSON.parse(userB.interests) : userB.interests || [];
    const targetBizA = typeof userA.networking_goals === 'string' ? JSON.parse(userA.networking_goals) : userA.networking_goals || [];
    const targetBizB = typeof userB.networking_goals === 'string' ? JSON.parse(userB.networking_goals) : userB.networking_goals || [];
    const goalsA = Array.isArray(metaA.goals) ? metaA.goals : [];
    const goalsB = Array.isArray(metaB.goals) ? metaB.goals : [];
    const hobbiesA = Array.isArray(metaA.hobbies) ? metaA.hobbies : [];
    const hobbiesB = Array.isArray(metaB.hobbies) ? metaB.hobbies : [];
    const interestsA = Array.isArray(metaA.interests)
        ? metaA.interests
        : Array.isArray(rawBridgesA) && typeof rawBridgesA[0] === 'string'
            ? rawBridgesA
            : [];
    const interestsB = Array.isArray(metaB.interests)
        ? metaB.interests
        : Array.isArray(rawBridgesB) && typeof rawBridgesB[0] === 'string'
            ? rawBridgesB
            : [];
    const groupsA = Array.isArray(metaA.networkingGroup)
        ? metaA.networkingGroup
        : typeof metaA.networkingGroup === 'string'
            ? [metaA.networkingGroup]
            : [];
    const groupsB = Array.isArray(metaB.networkingGroup)
        ? metaB.networkingGroup
        : typeof metaB.networkingGroup === 'string'
            ? [metaB.networkingGroup]
            : [];
    const reasons = [];
    let totalScore = 0;
    // 1. Shared Networking Groups (Up to 30 pts)
    const groupResult = arrayIntersectionScore(groupsA, groupsB, 30);
    if (groupResult.overlaps.length > 0) {
        const pts = groupResult.overlaps.length >= 2 ? 30 : 20;
        totalScore += pts;
        reasons.push(`Shared membership in ${groupResult.overlaps.join(' & ')}`);
    }
    // 2. Cross-Category Hobbies & Interests Overlap (Up to 25 pts)
    const tagsA = [...interestsA, ...hobbiesA];
    const tagsB = [...interestsB, ...hobbiesB];
    const tagResult = arrayIntersectionScore(tagsA, tagsB, 25);
    if (tagResult.overlaps.length > 0) {
        const pts = Math.min(25, tagResult.overlaps.length * 12);
        totalScore += pts;
        reasons.push(`Shared focus on ${tagResult.overlaps.join(', ')}`);
    }
    // 3. Target Business / Industry Overlap (Up to 15 pts)
    const targetBizResult = arrayIntersectionScore(targetBizA, targetBizB, 15);
    if (targetBizResult.overlaps.length > 0) {
        totalScore += targetBizResult.score;
        reasons.push(`Same target industry focus (${targetBizResult.overlaps[0]})`);
    }
    // 4. Intent / Goal Alignment (Up to 20 pts)
    const goalResult = matchGoalsFreeText(goalsA, goalsB);
    totalScore += goalResult.score;
    if (goalResult.overlaps.length > 0) {
        reasons.push(`Mutual networking focus on ${goalResult.overlaps.slice(0, 2).join(' & ')}`);
    }
    // 5. Geography Match (Up to 15 pts)
    const geoResult = matchGeography(metaA, metaB);
    totalScore += geoResult.score;
    if (geoResult.reason)
        reasons.push(geoResult.reason);
    // 6. Bridges Relevance (Up to 10 pts)
    const bridgesB = Array.isArray(rawBridgesB) && typeof rawBridgesB[0] === 'object' ? rawBridgesB : [];
    const bridgeResult = matchBridgeRelevance(goalsA, bridgesB);
    totalScore += bridgeResult.score;
    reasons.push(...bridgeResult.reasons);
    // 7. Profile Completeness (Up to 5 pts)
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
exports.default = {
    calculateMatchScore,
    arrayIntersectionScore,
    matchGeography,
    matchGoalsFreeText,
    matchBridgeRelevance,
    profileHealthScore,
};
