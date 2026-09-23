"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchmakingService = void 0;
const db_1 = require("../config/db");
const ProfileRepository_1 = require("../repositories/ProfileRepository");
const UserRepository_1 = require("../repositories/UserRepository");
const NotificationRepository_1 = require("../repositories/NotificationRepository");
const FeedRepository_1 = require("../repositories/FeedRepository");
function isFuzzyMatch(a, b) {
    if (!a || !b)
        return false;
    const s1 = a.trim().toLowerCase();
    const s2 = b.trim().toLowerCase();
    if (s1 === s2)
        return true;
    if (s1.includes(s2) || s2.includes(s1))
        return true;
    const tokens1 = s1.split(/[\s,/-]+/).filter((t) => t.length > 2);
    const tokens2 = s2.split(/[\s,/-]+/).filter((t) => t.length > 2);
    return tokens1.some((t1) => tokens2.some((t2) => t1.includes(t2) || t2.includes(t1)));
}
class MatchmakingService {
    /**
     * Run matchmaking engine for a specific user against all other active completed profiles.
     */
    static async processProfileMatches(sourceUserId) {
        try {
            const sourceUser = await UserRepository_1.UserRepository.findById(sourceUserId);
            const sourceProfile = await ProfileRepository_1.ProfileRepository.getProfileByUserId(sourceUserId);
            if (!sourceUser || !sourceProfile)
                return [];
            // Fetch all candidate user profiles
            const candidates = await (0, db_1.query)(`SELECT u.user_id, u.display_name, u.email, u.avatar_url,
                p.bio, p.headline, p.company, p.phone, p.skills, p.networking_goals, p.target_cities
         FROM users u
         JOIN user_profiles p ON u.user_id = p.user_id
         WHERE u.user_id != ? AND u.status = 'active'`, [sourceUserId]);
            const sourceData = this.extractProfileParameters(sourceProfile, sourceUser);
            const matchResults = [];
            for (const cand of candidates) {
                const candProfile = {
                    skills: typeof cand.skills === 'string' ? JSON.parse(cand.skills) : cand.skills || {},
                    networking_goals: typeof cand.networking_goals === 'string' ? JSON.parse(cand.networking_goals) : cand.networking_goals || [],
                    bio: cand.bio,
                    headline: cand.headline,
                    company: cand.company,
                };
                const candData = this.extractProfileParameters(candProfile, cand);
                // Evaluate match from perspective of source user looking at candidate
                const matchForSource = this.evaluateMatch(sourceData, candData, cand);
                // Evaluate match from perspective of candidate user looking at source user
                const matchForCand = this.evaluateMatch(candData, sourceData, sourceUser);
                if (matchForSource.score >= 40) {
                    matchResults.push(matchForSource);
                    // 1. Upsert recommendation for source user pointing to candidate
                    await this.upsertRecommendation(sourceUserId, matchForSource);
                    // 2. Upsert reciprocal recommendation for candidate pointing to source user
                    const recIdForCand = await this.upsertRecommendation(cand.user_id, matchForCand);
                    // 3. Emit notification to candidate user with candidate's recommendation ID
                    if (matchForCand.score >= 50 && recIdForCand) {
                        // Check if notification already sent recently
                        const existingNotif = await (0, db_1.query)(`SELECT notification_id FROM notifications WHERE user_id = ? AND entity_type = 'recommendation' AND entity_id = ? LIMIT 1`, [cand.user_id, recIdForCand]);
                        if (!existingNotif || existingNotif.length === 0) {
                            await NotificationRepository_1.NotificationRepository.create(cand.user_id, {
                                type: 'ai_suggestion',
                                title: '⭐ New Strategic Match Found!',
                                message: `${sourceUser.display_name} shares ${matchForCand.reasonsList.length} networking goals and interests with you.`,
                                entity_type: 'recommendation',
                                entity_id: recIdForCand,
                            });
                        }
                    }
                }
            }
            // Broadcast new/updated profile milestone to system feed if candidates found
            if (candidates.length > 0) {
                try {
                    const recentFeedPosts = await (0, db_1.query)(`SELECT post_id FROM posts WHERE user_id = ? AND created_at > NOW() - INTERVAL 1 HOUR LIMIT 1`, [sourceUserId]);
                    if (!recentFeedPosts || recentFeedPosts.length === 0) {
                        await FeedRepository_1.FeedRepository.create(sourceUserId, {
                            author_name: sourceUser.display_name,
                            author_title: sourceData.headline || 'Network Member',
                            author_avatar: sourceUser.avatar_url,
                            content: `🚀 Updated networking parameters! Exploring collaborations in ${sourceData.targetBusinesses.slice(0, 2).join(', ') || 'Strategic Partnerships & Tech'}. Open to connecting!`,
                            tags: ['NewMember', 'Matchmaking', 'Networking'],
                        });
                    }
                }
                catch (feedErr) {
                    console.error('Feed broadcast error:', feedErr);
                }
            }
            return matchResults;
        }
        catch (err) {
            console.error('MatchmakingService error:', err);
            return [];
        }
    }
    static extractProfileParameters(profile, user) {
        const skillsObj = typeof profile.skills === 'string' ? JSON.parse(profile.skills) : profile.skills || {};
        const hobbies = Array.isArray(skillsObj.hobbies) ? skillsObj.hobbies : [];
        const interests = Array.isArray(skillsObj.interests) ? skillsObj.interests : [];
        const goals = Array.isArray(skillsObj.goals) ? skillsObj.goals : [];
        const rawGroups = skillsObj.networkingGroup;
        const groups = Array.isArray(rawGroups)
            ? rawGroups
            : typeof rawGroups === 'string' && rawGroups.trim()
                ? [rawGroups]
                : [];
        const rawTargets = profile.networking_goals || skillsObj.targetBusinesses;
        const targetBusinesses = Array.isArray(rawTargets)
            ? rawTargets
            : typeof rawTargets === 'string' && rawTargets.trim()
                ? [rawTargets]
                : [];
        const bridgesObj = profile.interests || skillsObj.connectionsOffered;
        const bridges = Array.isArray(bridgesObj) ? bridgesObj : [];
        const bridgeDomains = bridges
            .map((b) => b.businessDomain || b.domain || '')
            .filter(Boolean);
        const location = skillsObj.currentCity || profile.headline || '';
        const targetCities = Array.isArray(skillsObj.targetCities) ? skillsObj.targetCities : [];
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
    static evaluateMatch(src, cand, candUser) {
        const reasons = [];
        let score = 0;
        // 1. Objectives / Goals Overlap (Max 25 pts)
        const commonGoals = src.goals.filter((g) => cand.goals.some((cg) => isFuzzyMatch(g, cg)));
        if (commonGoals.length > 0) {
            score += Math.min(25, commonGoals.length * 15);
            reasons.push(`Both are looking for ${commonGoals[0]}`);
        }
        // 2. Interests & Focus Overlap (Max 25 pts)
        const commonInterests = src.interests.filter((i) => cand.interests.some((ci) => isFuzzyMatch(i, ci)));
        if (commonInterests.length > 0) {
            score += Math.min(25, commonInterests.length * 12);
            reasons.push(`You share interest in ${commonInterests.slice(0, 2).join(' & ')}`);
        }
        // 3. Location / Target Cities Overlap (Max 20 pts)
        const isSameCity = src.location && cand.location && isFuzzyMatch(src.location, cand.location);
        const isTargetCity = src.targetCities.some((tc) => cand.location && isFuzzyMatch(tc, cand.location));
        if (isSameCity) {
            score += 20;
            reasons.push(`Both are based in ${src.location}`);
        }
        else if (isTargetCity) {
            score += 15;
            reasons.push(`Located in your target city ${cand.location}`);
        }
        // 4. Target Businesses / Industries Overlap (Max 15 pts)
        const commonIndustries = src.targetBusinesses.filter((tb) => cand.targetBusinesses.some((ctb) => isFuzzyMatch(tb, ctb)));
        if (commonIndustries.length > 0) {
            score += Math.min(15, commonIndustries.length * 10);
            reasons.push(`Same industry focus (${commonIndustries[0]})`);
        }
        // 5. Groups & Hobbies Overlap (Max 15 pts)
        const commonGroups = src.groups.filter((g) => cand.groups.some((cg) => isFuzzyMatch(g, cg)));
        const commonHobbies = src.hobbies.filter((h) => cand.hobbies.some((ch) => isFuzzyMatch(h, ch)));
        if (commonGroups.length > 0) {
            score += 10;
            reasons.push(`Shared membership in ${commonGroups[0]}`);
        }
        if (commonHobbies.length > 0) {
            score += 5;
            reasons.push(`Mutual hobby in ${commonHobbies[0]}`);
        }
        // Base fallback score for verified professionals to guarantee discovery
        if (score === 0) {
            score = 55;
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
    static async upsertRecommendation(userId, match) {
        const existing = await (0, db_1.query)(`SELECT recommendation_id FROM recommendations WHERE user_id = ? AND recommended_name = ? LIMIT 1`, [userId, match.name]);
        if (existing && existing.length > 0) {
            const recId = existing[0].recommendation_id;
            await (0, db_1.query)(`UPDATE recommendations 
         SET score = ?, reason = ?, skills = ?, recommended_role = ?, recommended_company = ?, avatar_url = ?, industry = ?
         WHERE recommendation_id = ?`, [
                match.score,
                match.reason,
                JSON.stringify(match.skills),
                match.role,
                match.company,
                match.avatarUrl,
                match.industry,
                recId,
            ]);
            return recId;
        }
        else {
            const res = await (0, db_1.query)(`INSERT INTO recommendations 
         (user_id, recommended_name, recommended_role, recommended_company, avatar_url, industry, skills, reason, score, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`, [
                userId,
                match.name,
                match.role,
                match.company,
                match.avatarUrl,
                match.industry,
                JSON.stringify(match.skills),
                match.reason,
                match.score,
            ]);
            return res.insertId;
        }
    }
}
exports.MatchmakingService = MatchmakingService;
