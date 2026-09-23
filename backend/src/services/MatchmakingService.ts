import { query } from '../config/db';
import { ProfileRepository } from '../repositories/ProfileRepository';
import { UserRepository } from '../repositories/UserRepository';
import { NotificationRepository } from '../repositories/NotificationRepository';

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
  /**
   * Run matchmaking engine for a specific user against all other active completed profiles.
   */
  static async processProfileMatches(sourceUserId: number): Promise<ProfileMatchResult[]> {
    try {
      const sourceUser = await UserRepository.findById(sourceUserId);
      const sourceProfile = await ProfileRepository.getProfileByUserId(sourceUserId);
      if (!sourceUser || !sourceProfile) return [];

      // Fetch all candidate user profiles
      const candidates = await query<any[]>(
        `SELECT u.user_id, u.display_name, u.email, u.avatar_url,
                p.bio, p.headline, p.company, p.phone, p.skills, p.networking_goals, p.target_cities
         FROM users u
         JOIN user_profiles p ON u.user_id = p.user_id
         WHERE u.user_id != ? AND u.status = 'active'`,
        [sourceUserId]
      );

      const sourceData = this.extractProfileParameters(sourceProfile, sourceUser);
      const matchResults: ProfileMatchResult[] = [];

      for (const cand of candidates) {
        const candProfile = {
          skills: typeof cand.skills === 'string' ? JSON.parse(cand.skills) : cand.skills || {},
          networking_goals: typeof cand.networking_goals === 'string' ? JSON.parse(cand.networking_goals) : cand.networking_goals || [],
          bio: cand.bio,
          headline: cand.headline,
          company: cand.company,
        };
        const candData = this.extractProfileParameters(candProfile, cand);

        const match = this.evaluateMatch(sourceData, candData, cand);
        if (match.score >= 40) {
          matchResults.push(match);

          // Upsert recommendation for source user
          const recId = await this.upsertRecommendation(sourceUserId, match);

          // Emit Notification to candidate user if reciprocal match is strong (score >= 60)
          if (match.score >= 60 && recId) {
            await NotificationRepository.create(cand.user_id, {
              type: 'MATCH_FOUND',
              title: '⭐ New Strategic Match Found!',
              message: `${sourceUser.display_name} shares ${match.reasonsList.length} networking goals and interests with you.`,
              entity_type: 'recommendation',
              entity_id: recId,
            });
          }
        }
      }

      return matchResults;
    } catch (err) {
      console.error('MatchmakingService error:', err);
      return [];
    }
  }

  private static extractProfileParameters(profile: any, user: any) {
    const skillsObj = typeof profile.skills === 'string' ? JSON.parse(profile.skills) : profile.skills || {};
    
    const hobbies: string[] = Array.isArray(skillsObj.hobbies) ? skillsObj.hobbies : [];
    const interests: string[] = Array.isArray(skillsObj.interests) ? skillsObj.interests : [];
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

    const bridgesObj = profile.interests || skillsObj.connectionsOffered;
    const bridges: any[] = Array.isArray(bridgesObj) ? bridgesObj : [];
    const bridgeDomains: string[] = bridges
      .map((b: any) => b.businessDomain || b.domain || '')
      .filter(Boolean);

    const location: string = skillsObj.currentCity || profile.headline || '';
    const targetCities: string[] = Array.isArray(skillsObj.targetCities) ? skillsObj.targetCities : [];

    return {
      name: user.display_name || user.displayName || 'User',
      company: profile.company || 'Innovator',
      headline: profile.headline || 'Strategic Professional',
      hobbies,
      interests,
      goals,
      groups,
      targetBusinesses,
      bridgeDomains,
      location,
      targetCities,
    };
  }

  private static evaluateMatch(src: any, cand: any, candUser: any): ProfileMatchResult {
    const reasons: string[] = [];
    let score = 0;

    // 1. Objectives / Goals Overlap (Max 25 pts)
    const commonGoals = src.goals.filter((g: string) =>
      cand.goals.some((cg: string) => cg.toLowerCase() === g.toLowerCase())
    );
    if (commonGoals.length > 0) {
      score += Math.min(25, commonGoals.length * 15);
      reasons.push(`Both are looking for ${commonGoals[0]}`);
    }

    // 2. Interests & Focus Overlap (Max 25 pts)
    const commonInterests = src.interests.filter((i: string) =>
      cand.interests.some((ci: string) => ci.toLowerCase() === i.toLowerCase())
    );
    if (commonInterests.length > 0) {
      score += Math.min(25, commonInterests.length * 12);
      reasons.push(`You share interest in ${commonInterests.slice(0, 2).join(' & ')}`);
    }

    // 3. Location / Target Cities Overlap (Max 20 pts)
    const isSameCity = src.location && cand.location && src.location.toLowerCase() === cand.location.toLowerCase();
    const isTargetCity = src.targetCities.some((tc: string) =>
      cand.location && cand.location.toLowerCase().includes(tc.toLowerCase())
    );

    if (isSameCity) {
      score += 20;
      reasons.push(`Both are based in ${src.location}`);
    } else if (isTargetCity) {
      score += 15;
      reasons.push(`Located in your target city ${cand.location}`);
    }

    // 4. Target Businesses / Industries Overlap (Max 15 pts)
    const commonIndustries = src.targetBusinesses.filter((tb: string) =>
      cand.targetBusinesses.some((ctb: string) => ctb.toLowerCase() === tb.toLowerCase())
    );
    if (commonIndustries.length > 0) {
      score += Math.min(15, commonIndustries.length * 10);
      reasons.push(`Same industry focus (${commonIndustries[0]})`);
    }

    // 5. Groups & Hobbies Overlap (Max 15 pts)
    const commonGroups = src.groups.filter((g: string) =>
      cand.groups.some((cg: string) => cg.toLowerCase() === g.toLowerCase())
    );
    const commonHobbies = src.hobbies.filter((h: string) =>
      cand.hobbies.some((ch: string) => ch.toLowerCase() === h.toLowerCase())
    );

    if (commonGroups.length > 0) {
      score += 10;
      reasons.push(`Shared membership in ${commonGroups[0]}`);
    }
    if (commonHobbies.length > 0) {
      score += 5;
      reasons.push(`Mutual hobby in ${commonHobbies[0]}`);
    }

    // Base fallback score for verified professionals
    if (score === 0) {
      score = 45;
      reasons.push('Shared networking ecosystem & verified professional identity');
    }

    const finalScore = Math.min(98, score);
    const formattedReason = reasons.map((r) => `✓ ${r}`).join('\n');
    const skillsList = [...new Set([...cand.interests, ...cand.targetBusinesses])].slice(0, 4);

    return {
      targetUserId: candUser.user_id,
      name: candUser.display_name,
      role: cand.headline || 'Founder & CEO',
      company: cand.company || 'TechNova Solutions',
      avatarUrl: candUser.avatar_url,
      industry: cand.targetBusinesses[0] || 'Technology & SaaS',
      score: finalScore,
      reason: formattedReason,
      reasonsList: reasons,
      skills: skillsList.length > 0 ? skillsList : ['SaaS', 'Technology', 'Product Strategy'],
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
