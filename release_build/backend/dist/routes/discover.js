"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../config/db");
const matchmakingCron_1 = require("../jobs/matchmakingCron");
const router = (0, express_1.Router)();
/**
 * GET /api/discover
 * Fetches top N precomputed matches for logged-in user.
 * Excludes skipped profiles and includes 1-in-5 Diversity Injection.
 */
router.get('/', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const limit = parseInt(String(req.query.limit || '10'), 10);
        const offset = parseInt(String(req.query.offset || '0'), 10);
        // 1. Fetch skipped profile IDs
        const skippedRows = await (0, db_1.query)(`SELECT skipped_user_id FROM skipped_profiles WHERE user_id = ?`, [userId]);
        const skippedUserIds = skippedRows.map((r) => r.skipped_user_id);
        const excludeIds = [userId, ...skippedUserIds];
        // 2. Query top matches from match_scores
        let matches = await (0, db_1.query)(`SELECT 
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
       LIMIT ? OFFSET ?`, [userId, ...excludeIds, limit, offset]);
        // Dynamic fallback if no precomputed scores exist yet
        if (matches.length === 0) {
            await (0, matchmakingCron_1.runMatchmakingPrecomputation)();
            matches = await (0, db_1.query)(`SELECT 
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
         LIMIT ? OFFSET ?`, [userId, ...excludeIds, limit, offset]);
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
            const randomLower = await (0, db_1.query)(`SELECT 
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
         LIMIT 1`, [userId, ...diversityExclude]);
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
    }
    catch (err) {
        next(err);
    }
});
/**
 * GET /api/discover/profile/:targetUserId
 * Fetches full public/network profile for modal display.
 */
router.get('/profile/:targetUserId', async (req, res, next) => {
    try {
        const targetUserId = parseInt(String(req.params.targetUserId), 10);
        if (!targetUserId || isNaN(targetUserId)) {
            return res.status(400).json({ success: false, message: 'Valid targetUserId is required' });
        }
        const rows = await (0, db_1.query)(`SELECT 
         u.user_id, u.display_name, u.email, u.avatar_url, u.status,
         p.headline, p.bio, p.company, p.job_title, p.location, p.industry, 
         p.website, p.linkedin_url, p.phone, p.timezone, p.skills, p.interests, p.networking_goals,
         per.persona_name, per.communication_style, per.preferred_people, per.networking_goal AS persona_goal
       FROM users u
       LEFT JOIN user_profiles p ON u.user_id = p.user_id
       LEFT JOIN user_personas per ON u.user_id = per.user_id
       WHERE u.user_id = ? AND u.status = 'active'
       LIMIT 1`, [targetUserId]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }
        const row = rows[0];
        // Parse JSON fields
        const parsedSkills = typeof row.skills === 'string' ? JSON.parse(row.skills) : row.skills || {};
        const parsedInterestsRaw = typeof row.interests === 'string' ? JSON.parse(row.interests) : row.interests || [];
        const parsedGoals = typeof row.networking_goals === 'string' ? JSON.parse(row.networking_goals) : row.networking_goals || [];
        // Extract bridge objects & interest string arrays
        let bridges = [];
        let interestStrings = [];
        if (Array.isArray(parsedInterestsRaw)) {
            if (parsedInterestsRaw.length > 0 && typeof parsedInterestsRaw[0] === 'object' && parsedInterestsRaw[0] !== null) {
                bridges = parsedInterestsRaw;
            }
            else if (parsedInterestsRaw.length > 0 && typeof parsedInterestsRaw[0] === 'string') {
                interestStrings = parsedInterestsRaw;
            }
        }
        if (bridges.length === 0 && Array.isArray(parsedSkills.connectionsOffered)) {
            bridges = parsedSkills.connectionsOffered;
        }
        if (interestStrings.length === 0 && Array.isArray(parsedSkills.interests)) {
            interestStrings = parsedSkills.interests;
        }
        const profileData = {
            userId: row.user_id,
            displayName: row.display_name,
            email: row.email,
            avatarUrl: row.avatar_url,
            headline: row.headline || 'Strategic Professional',
            company: row.company || 'NexaLink Member',
            jobTitle: row.job_title || row.headline || 'Professional',
            domain: row.industry || parsedSkills.domain || 'Technology & Services',
            bio: row.bio || parsedSkills.servicesOffered || 'No bio provided.',
            location: row.location || parsedSkills.currentCity || 'Mumbai, India',
            currentCity: parsedSkills.currentCity || row.location || 'Mumbai, India',
            targetCities: Array.isArray(parsedSkills.targetCities) ? parsedSkills.targetCities : [],
            phone: row.phone,
            website: row.website,
            linkedinUrl: row.linkedin_url,
            networkingGroups: Array.isArray(parsedSkills.networkingGroup)
                ? parsedSkills.networkingGroup
                : typeof parsedSkills.networkingGroup === 'string' && parsedSkills.networkingGroup.trim()
                    ? [parsedSkills.networkingGroup]
                    : [],
            hobbies: Array.isArray(parsedSkills.hobbies) ? parsedSkills.hobbies : [],
            interests: interestStrings,
            goals: Array.isArray(parsedSkills.goals) ? parsedSkills.goals : [],
            targetBusinesses: Array.isArray(parsedGoals)
                ? parsedGoals
                : Array.isArray(parsedSkills.targetBusinesses)
                    ? parsedSkills.targetBusinesses
                    : [],
            connectionsOffered: bridges,
            persona: {
                name: row.persona_name,
                communicationStyle: row.communication_style,
                preferredPeople: row.preferred_people,
                goal: row.persona_goal,
            }
        };
        return res.json({
            success: true,
            data: profileData,
        });
    }
    catch (err) {
        next(err);
    }
});
/**
 * POST /api/discover/skip/:userId
 * Dismisses candidate profile for fatigue handling.
 */
router.post('/skip/:userId', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const skippedUserId = parseInt(String(req.params.userId), 10);
        if (!skippedUserId || isNaN(skippedUserId)) {
            return res.status(400).json({ success: false, message: 'Valid target userId required' });
        }
        await (0, db_1.query)(`INSERT INTO skipped_profiles (user_id, skipped_user_id, skipped_at)
       VALUES (?, ?, NOW())
       ON DUPLICATE KEY UPDATE skipped_at = NOW()`, [userId, skippedUserId]);
        return res.json({
            success: true,
            message: 'Profile dismissed from discover feed',
        });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
