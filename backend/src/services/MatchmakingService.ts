import { query } from '../config/db';
import { ProfileRepository } from '../repositories/ProfileRepository';
import { UserRepository } from '../repositories/UserRepository';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { FeedRepository } from '../repositories/FeedRepository';
import { UserMatchScoreRepository, UserMatchScoreRow } from '../repositories/UserMatchScoreRepository';
import { GOAL_COMPLEMENT_MAP, NetworkingGoalEnum } from '../config/GoalTaxonomy';

export interface ConnectionBridge {
  businessDomain: string;
  personName: string;
  orgName: string;
  role: string;
  city?: string;
  relationshipContext?: string;
}

export interface ProfileData {
  userId: number;
  displayName: string;
  bio?: string;
  headline?: string;
  jobTitle?: string;
  company?: string;
  avatarUrl?: string | null;
  linkedin?: string;
  instagram?: string;
  website?: string;
  currentCity?: string;
  targetCities?: string[];
  networkingGroup?: string[];
  hobbies?: string[];
  interests?: string[];
  goals?: string[];
  targetBusinesses?: string[];
  connectionsOffered?: ConnectionBridge[];
}

export interface MatchResult {
  userId: number;
  score: number;
  reasons: string[];
}

export interface ProfileMatchResult {
  targetUserId: number;
  name: string;
  role: string;
  company: string;
  avatarUrl: string | null;
  industry: string | null;
  score: number;
  reason: string;
  reasonsList: string[];
  skills: string[];
}

export class MatchmakingService {
  // ==========================================
  // HELPER SCORING FUNCTIONS
  // ==========================================

  public static arrayIntersectionScore(
    a: string[] = [],
    b: string[] = [],
    maxPoints: number
  ): { score: number; overlaps: string[] } {
    if (!a.length || !b.length) return { score: 0, overlaps: [] };

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

  public static matchGeography(userA: ProfileData, userB: ProfileData): { score: number; reason?: string } {
    const cityA = userA.currentCity?.trim().toLowerCase();
    const cityB = userB.currentCity?.trim().toLowerCase();
    const targetA = (userA.targetCities || []).map((c) => c.trim().toLowerCase());
    const targetB = (userB.targetCities || []).map((c) => c.trim().toLowerCase());

    // 1. Exact city match = Full points (15 pts)
    if (cityA && cityB && cityA === cityB) {
      return { score: 15, reason: `Both located in ${userA.currentCity}` };
    }

    // 2. City matches target city = Partial points (10 pts)
    if (cityB && targetA.includes(cityB)) {
      return { score: 10, reason: `Located in your target city ${userB.currentCity}` };
    }
    if (cityA && targetB.includes(cityA)) {
      return { score: 10, reason: `Targeting your location ${userA.currentCity}` };
    }

    // 3. Target cities overlap = Partial points (8 pts)
    const commonTargets = targetA.filter((tc) => targetB.includes(tc));
    if (commonTargets.length > 0) {
      return { score: 8, reason: `Common expansion focus in target cities` };
    }

    return { score: 0 };
  }

  public static matchIntents(
    goalsA: string[] = [],
    connectionsOfferedB: ConnectionBridge[] = [],
    jobTitleB = ''
  ): { score: number; reasons: string[] } {
    let points = 0;
    const reasons: string[] = [];
    const jobTitleLower = (jobTitleB || '').toLowerCase();

    for (const goalStr of goalsA) {
      const enumKey = goalStr as NetworkingGoalEnum;
      const complementRule = GOAL_COMPLEMENT_MAP[enumKey];
      if (!complementRule) continue;

      // Check job title complementarity
      const matchedJobKeyword = complementRule.targetJobKeywords.find((kw) => jobTitleLower.includes(kw));
      if (matchedJobKeyword) {
        points += 15;
        reasons.push(`Objective "${goalStr}" complements role (${jobTitleB})`);
      }

      // Check connections offered domain complementarity
      const matchedBridge = connectionsOfferedB.find((b) =>
        complementRule.targetBridgeDomains.some((d) => (b.businessDomain || '').toLowerCase().includes(d.toLowerCase()))
      );
      if (matchedBridge) {
        points += 15;
        reasons.push(`Objective "${goalStr}" matches offered network bridge in ${matchedBridge.businessDomain}`);
      }
    }

    return { score: Math.min(30, points), reasons };
  }

  public static matchBridges(
    goalsA: string[] = [],
    targetBusinessesA: string[] = [],
    bridgesB: ConnectionBridge[] = []
  ): { score: number; reasons: string[] } {
    if (!bridgesB.length) return { score: 0, reasons: [] };

    let points = 0;
    const reasons: string[] = [];

    for (const bridge of bridgesB) {
      const domainLower = (bridge.businessDomain || '').toLowerCase();
      if (!domainLower) continue;

      const isTargetMatch = targetBusinessesA.some(
        (tb) => tb.toLowerCase().includes(domainLower) || domainLower.includes(tb.toLowerCase())
      );

      if (isTargetMatch) {
        points += 10;
        reasons.push(
          `Offers warm connection to ${bridge.personName || 'Contact'} (${bridge.role || 'Executive'} at ${
            bridge.orgName || 'Company'
          }) in ${bridge.businessDomain}`
        );
      }
    }

    return { score: Math.min(20, points), reasons };
  }

  public static profileHealthScore(user: ProfileData): { score: number; penalties: string[] } {
    let score = 5;
    const penalties: string[] = [];

    if (!user.bio || user.bio.trim().length < 15) {
      score -= 1;
      penalties.push('Short bio');
    }
    if (!user.avatarUrl) {
      score -= 1;
      penalties.push('Missing photo');
    }
    if (!user.headline) {
      score -= 1;
      penalties.push('Missing headline');
    }

    return { score: Math.max(0, score), penalties };
  }

  // ==========================================
  // PURE MATCHMAKING ALGORITHM (0 - 100 PTS)
  // ==========================================

  public static calculateMatchScore(userA: ProfileData, userB: ProfileData): MatchResult {
    const reasons: string[] = [];
    let totalScore = 0;

    // 1. Shared Networking Groups (Up to 30 pts)
    const groupResult = this.arrayIntersectionScore(userA.networkingGroup, userB.networkingGroup, 30);
    if (groupResult.overlaps.length > 0) {
      const pts = groupResult.overlaps.length >= 2 ? 30 : 20;
      totalScore += pts;
      reasons.push(`Shared membership in ${groupResult.overlaps.join(' & ')}`);
    }

    // 2. Cross-Category Hobbies & Personal Interests Overlap (Up to 25 pts)
    const tagsA = [...(userA.interests || []), ...(userA.hobbies || [])];
    const tagsB = [...(userB.interests || []), ...(userB.hobbies || [])];
    const tagOverlap = this.arrayIntersectionScore(tagsA, tagsB, 25);
    if (tagOverlap.overlaps.length > 0) {
      const pts = Math.min(25, tagOverlap.overlaps.length * 12);
      totalScore += pts;
      reasons.push(`Shared focus on ${tagOverlap.overlaps.join(', ')}`);
    }

    // 3. Target Industry / Business Overlap (Up to 15 pts)
    const targetOverlap = this.arrayIntersectionScore(userA.targetBusinesses, userB.targetBusinesses, 15);
    if (targetOverlap.overlaps.length > 0) {
      totalScore += targetOverlap.score;
      reasons.push(`Shared target industry focus (${targetOverlap.overlaps[0]})`);
    }

    // 4. Intent & Objective Complementarity (Up to 20 pts)
    const intentResult = this.matchIntents(userA.goals, userB.connectionsOffered, userB.jobTitle || userB.headline);
    totalScore += intentResult.score;
    reasons.push(...intentResult.reasons);

    // 5. Geography Match (Up to 15 pts)
    const geoResult = this.matchGeography(userA, userB);
    totalScore += geoResult.score;
    if (geoResult.reason) reasons.push(geoResult.reason);

    // 6. Network Bridge Connections Value (Up to 15 pts)
    const bridgeResult = this.matchBridges(userA.goals, userA.targetBusinesses, userB.connectionsOffered);
    totalScore += bridgeResult.score;
    reasons.push(...bridgeResult.reasons);

    // 7. Profile Completeness Health (Up to 5 pts)
    const healthResult = this.profileHealthScore(userB);
    totalScore += healthResult.score;

    // Baseline fallback if low overlap but valid users
    if (totalScore === 0) {
      totalScore = 40;
      reasons.push('Shared professional ecosystem identity');
    }

    const finalScore = Math.min(98, totalScore);

    return {
      userId: userB.userId,
      score: finalScore,
      reasons: [...new Set(reasons)],
    };
  }

  // ==========================================
  // PRECOMPUTATION & SYNC PROCESSOR
  // ==========================================

  static async processProfileMatches(sourceUserId: number): Promise<ProfileMatchResult[]> {
    try {
      const sourceUser = await UserRepository.findById(sourceUserId);
      const sourceProfile = await ProfileRepository.getProfileByUserId(sourceUserId);
      if (!sourceUser || !sourceProfile) return [];

      const candidates = await query<any[]>(
        `SELECT u.user_id, u.display_name, u.email, u.avatar_url,
                p.bio, p.headline, p.company, p.job_title, p.phone, p.skills, p.networking_goals, p.interests
         FROM users u
         JOIN user_profiles p ON u.user_id = p.user_id
         WHERE u.user_id != ? AND u.status = 'active'`,
        [sourceUserId]
      );

      const sourceData = this.extractProfileParameters(sourceProfile, sourceUser);
      const matchResults: ProfileMatchResult[] = [];
      const batchPrecomputations: { userAId: number; userBId: number; score: number; reasons: string[]; isMutual: boolean }[] = [];

      for (const cand of candidates) {
        const candProfile = {
          skills: typeof cand.skills === 'string' ? JSON.parse(cand.skills) : cand.skills || {},
          networking_goals: typeof cand.networking_goals === 'string' ? JSON.parse(cand.networking_goals) : cand.networking_goals || [],
          interests: typeof cand.interests === 'string' ? JSON.parse(cand.interests) : cand.interests || [],
          bio: cand.bio,
          headline: cand.headline,
          company: cand.company,
          job_title: cand.job_title,
        };
        const candData = this.extractProfileParameters(candProfile, cand);

        // Evaluate match from perspective of source user looking at candidate
        const matchForSource = this.calculateMatchScore(sourceData, candData);

        // Evaluate match from perspective of candidate user looking at source user
        const matchForCand = this.calculateMatchScore(candData, sourceData);

        let finalScoreForSource = matchForSource.score;
        let isMutual = false;

        // Mutual Match Bonus (+10 points if both scores are high)
        if (matchForSource.score >= 40 && matchForCand.score >= 40) {
          finalScoreForSource = Math.min(98, finalScoreForSource + 10);
          isMutual = true;
          matchForSource.reasons.unshift('⭐ High Mutual Synergy Match');
        }

        const matchResultItem: ProfileMatchResult = {
          targetUserId: cand.user_id,
          name: cand.display_name,
          role: cand.headline || cand.job_title || 'Founder & CEO',
          company: cand.company || 'TechNova Solutions',
          avatarUrl: cand.avatar_url,
          industry: (candData.targetBusinesses && candData.targetBusinesses[0]) || 'Technology & SaaS',
          score: finalScoreForSource,
          reason: matchForSource.reasons.map((r) => `✓ ${r}`).join('\n'),
          reasonsList: matchForSource.reasons,
          skills: [...new Set([...(candData.interests || []), ...(candData.targetBusinesses || []), ...(candData.networkingGroup || [])])].slice(0, 4),
        };

        if (finalScoreForSource >= 10) {
          matchResults.push(matchResultItem);

          // 1. Upsert recommendation row for legacy UI backward compatibility
          await this.upsertRecommendation(sourceUserId, matchResultItem);

          // 2. Add to precomputation batch for fast UserMatchScore query
          batchPrecomputations.push({
            userAId: sourceUserId,
            userBId: cand.user_id,
            score: finalScoreForSource,
            reasons: matchForSource.reasons,
            isMutual,
          });

          batchPrecomputations.push({
            userAId: cand.user_id,
            userBId: sourceUserId,
            score: matchForCand.score,
            reasons: matchForCand.reasons,
            isMutual,
          });

          // 3. Emit real-time notification to candidate
          const recIdForCand = await this.upsertRecommendation(cand.user_id, {
            ...matchResultItem,
            targetUserId: sourceUserId,
            name: sourceUser.display_name,
            role: sourceData.headline || 'Network Member',
            company: sourceData.company || 'Innovator',
            avatarUrl: sourceUser.avatar_url,
            score: matchForCand.score,
            reason: matchForCand.reasons.map((r) => `✓ ${r}`).join('\n'),
            reasonsList: matchForCand.reasons,
          });

          if (matchForCand.score >= 20 && recIdForCand) {
            const existingNotif = await query<any[]>(
              `SELECT notification_id FROM notifications WHERE user_id = ? AND entity_type = 'recommendation' AND entity_id = ? LIMIT 1`,
              [cand.user_id, recIdForCand]
            );

            if (!existingNotif || existingNotif.length === 0) {
              await NotificationRepository.create(cand.user_id, {
                type: 'ai_suggestion',
                title: '⭐ New Strategic Match Found!',
                message: `${sourceUser.display_name} shares ${matchForCand.reasons.length} networking goals & interests with you.`,
                entity_type: 'recommendation',
                entity_id: recIdForCand,
              });
            }
          }
        }
      }

      // Upsert batch into user_match_scores table
      await UserMatchScoreRepository.upsertScoreBatch(batchPrecomputations);

      return matchResults;
    } catch (err) {
      console.error('MatchmakingService error:', err);
      return [];
    }
  }

  // ==========================================
  // READ DISCOVER FEED WITH DIVERSITY INJECTION
  // ==========================================

  static async getDiscoverFeed(userId: number, limit = 10, offset = 0): Promise<UserMatchScoreRow[]> {
    let topMatches = await UserMatchScoreRepository.getTopMatches(userId, limit, offset);

    // If no precomputed scores found, trigger calculation dynamically
    if (topMatches.length === 0) {
      await this.processProfileMatches(userId);
      topMatches = await UserMatchScoreRepository.getTopMatches(userId, limit, offset);
    }

    if (topMatches.length === 0) return [];

    // Diversity Injection: 1 out of every 5 results is picked from lower-scored/random profiles to break filter bubbles
    const finalResults = [...topMatches];
    const excludeIds = topMatches.map((m) => m.user_b_id);

    for (let i = 4; i < finalResults.length; i += 5) {
      const diversityPick = await UserMatchScoreRepository.getRandomDiversityMatches(userId, excludeIds, 1);
      if (diversityPick.length > 0) {
        finalResults[i] = diversityPick[0];
        excludeIds.push(diversityPick[0].user_b_id);
      }
    }

    return finalResults;
  }

  // Helper extraction method
  private static extractProfileParameters(profile: any, user: any): ProfileData {
    const skillsObj = typeof profile.skills === 'string' ? JSON.parse(profile.skills) : profile.skills || {};

    const hobbies: string[] = Array.isArray(skillsObj.hobbies) ? skillsObj.hobbies : [];
    const interestsFromSkills: string[] = Array.isArray(skillsObj.interests) ? skillsObj.interests : [];

    // Check if profile.interests is string array or bridge objects array
    const rawInterests = typeof profile.interests === 'string' ? JSON.parse(profile.interests) : profile.interests || [];
    let bridges: ConnectionBridge[] = [];
    let interestsFromProfile: string[] = [];

    if (Array.isArray(rawInterests)) {
      if (rawInterests.length > 0 && typeof rawInterests[0] === 'object' && rawInterests[0] !== null && 'businessDomain' in rawInterests[0]) {
        bridges = rawInterests as ConnectionBridge[];
      } else if (rawInterests.length > 0 && typeof rawInterests[0] === 'string') {
        interestsFromProfile = rawInterests as string[];
      }
    }

    if (!bridges.length && Array.isArray(skillsObj.connectionsOffered)) {
      bridges = skillsObj.connectionsOffered;
    }

    const combinedInterests = [...new Set([...interestsFromSkills, ...interestsFromProfile])];
    const goals: string[] = Array.isArray(skillsObj.goals) ? skillsObj.goals : [];

    const rawGroups = skillsObj.networkingGroup;
    const groups: string[] = Array.isArray(rawGroups)
      ? rawGroups
      : typeof rawGroups === 'string' && rawGroups.trim()
      ? [rawGroups]
      : [];

    const rawTargets = profile.networking_goals || skillsObj.targetBusinesses;
    const targetBusinesses: string[] = Array.isArray(rawTargets)
      ? rawTargets
      : typeof rawTargets === 'string' && rawTargets.trim()
      ? [rawTargets]
      : [];

    return {
      userId: user.user_id || user.userId,
      displayName: user.display_name || user.displayName || 'User',
      avatarUrl: user.avatar_url,
      company: profile.company || 'Innovator',
      headline: profile.headline || 'Strategic Professional',
      jobTitle: profile.job_title || profile.headline,
      bio: profile.bio,
      linkedin: profile.linkedin_url,
      currentCity: skillsObj.currentCity || profile.headline || '',
      targetCities: Array.isArray(skillsObj.targetCities) ? skillsObj.targetCities : [],
      networkingGroup: groups,
      hobbies,
      interests: combinedInterests,
      goals,
      targetBusinesses,
      connectionsOffered: bridges,
    };
  }

  private static async upsertRecommendation(userId: number, match: ProfileMatchResult): Promise<number | null> {
    const existing = await query<any[]>(
      `SELECT recommendation_id FROM recommendations WHERE user_id = ? AND recommended_name = ? LIMIT 1`,
      [userId, match.name]
    );

    if (existing && existing.length > 0) {
      const recId = existing[0].recommendation_id;
      await query(
        `UPDATE recommendations 
         SET score = ?, reason = ?, skills = ?, recommended_role = ?, recommended_company = ?, avatar_url = ?, industry = ?
         WHERE recommendation_id = ?`,
        [
          match.score,
          match.reason,
          JSON.stringify(match.skills),
          match.role,
          match.company,
          match.avatarUrl,
          match.industry,
          recId,
        ]
      );
      return recId;
    } else {
      const res: any = await query(
        `INSERT INTO recommendations 
         (user_id, recommended_name, recommended_role, recommended_company, avatar_url, industry, skills, reason, score, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          userId,
          match.name,
          match.role,
          match.company,
          match.avatarUrl,
          match.industry,
          JSON.stringify(match.skills),
          match.reason,
          match.score,
        ]
      );
      return res.insertId;
    }
  }
}
