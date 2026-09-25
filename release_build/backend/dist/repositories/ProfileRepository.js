"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileRepository = void 0;
const db_1 = require("../config/db");
class ProfileRepository {
    static async isProfileComplete(userId) {
        const profileRows = await (0, db_1.query)(`SELECT bio, phone, networking_goals, skills, interests FROM user_profiles WHERE user_id = ? LIMIT 1`, [userId]);
        if (!profileRows[0])
            return false;
        const p = profileRows[0];
        if (!p.bio || !p.bio.trim() || !p.phone || !p.phone.trim()) {
            return false;
        }
        const skills = typeof p.skills === 'string' ? JSON.parse(p.skills) : p.skills || {};
        const goals = typeof p.networking_goals === 'string' ? JSON.parse(p.networking_goals) : p.networking_goals;
        const bridges = typeof p.interests === 'string' ? JSON.parse(p.interests) : p.interests;
        const groupVal = skills?.networkingGroup;
        const hasGroup = Array.isArray(groupVal)
            ? groupVal.some((g) => typeof g === 'string' && g.trim().length > 0)
            : typeof groupVal === 'string' && groupVal.trim().length > 0;
        const hasHobby = Array.isArray(skills?.hobbies) && skills.hobbies.some((h) => typeof h === 'string' && h.trim().length > 0);
        const hasInterest = Array.isArray(skills?.interests) && skills.interests.some((i) => typeof i === 'string' && i.trim().length > 0);
        const hasObjective = Array.isArray(skills?.goals) && skills.goals.some((o) => typeof o === 'string' && o.trim().length > 0);
        const hasTarget = Array.isArray(goals) && goals.some((t) => typeof t === 'string' && t.trim().length > 0);
        const hasBridge = Array.isArray(bridges) && bridges.length > 0;
        return Boolean(hasGroup && hasHobby && hasInterest && hasObjective && hasTarget && hasBridge);
    }
    static async getProfileByUserId(userId) {
        const rows = await (0, db_1.query)(`SELECT * FROM user_profiles WHERE user_id = ? LIMIT 1`, [userId]);
        if (!rows[0])
            return null;
        const row = rows[0];
        return {
            ...row,
            skills: typeof row.skills === 'string' ? JSON.parse(row.skills) : row.skills || [],
            interests: typeof row.interests === 'string' ? JSON.parse(row.interests) : row.interests || [],
            networking_goals: typeof row.networking_goals === 'string' ? JSON.parse(row.networking_goals) : row.networking_goals || [],
        };
    }
    static async upsertProfile(userId, data) {
        const existing = await this.getProfileByUserId(userId);
        const skillsJson = data.skills ? JSON.stringify(data.skills) : JSON.stringify([]);
        const interestsJson = data.interests ? JSON.stringify(data.interests) : JSON.stringify([]);
        const goalsJson = data.networking_goals ? JSON.stringify(data.networking_goals) : JSON.stringify([]);
        if (existing) {
            await (0, db_1.query)(`UPDATE user_profiles SET
          headline = COALESCE(?, headline),
          bio = COALESCE(?, bio),
          company = COALESCE(?, company),
          job_title = COALESCE(?, job_title),
          location = COALESCE(?, location),
          industry = COALESCE(?, industry),
          website = COALESCE(?, website),
          linkedin_url = COALESCE(?, linkedin_url),
          phone = COALESCE(?, phone),
          timezone = COALESCE(?, timezone),
          avatar_url = COALESCE(?, avatar_url),
          skills = COALESCE(?, skills),
          interests = COALESCE(?, interests),
          networking_goals = COALESCE(?, networking_goals)
        WHERE user_id = ?`, [
                data.headline ?? null,
                data.bio ?? null,
                data.company ?? null,
                data.job_title ?? null,
                data.location ?? null,
                data.industry ?? null,
                data.website ?? null,
                data.linkedin_url ?? null,
                data.phone ?? null,
                data.timezone ?? null,
                data.avatar_url ?? null,
                data.skills ? skillsJson : null,
                data.interests ? interestsJson : null,
                data.networking_goals ? goalsJson : null,
                userId,
            ]);
        }
        else {
            await (0, db_1.query)(`INSERT INTO user_profiles (
          user_id, headline, bio, company, job_title, location, industry, website, linkedin_url, phone, timezone, avatar_url, skills, interests, networking_goals
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                userId,
                data.headline || null,
                data.bio || null,
                data.company || null,
                data.job_title || null,
                data.location || null,
                data.industry || null,
                data.website || null,
                data.linkedin_url || null,
                data.phone || null,
                data.timezone || 'UTC',
                data.avatar_url || null,
                skillsJson,
                interestsJson,
                goalsJson,
            ]);
        }
    }
    static async getPersonaByUserId(userId) {
        const rows = await (0, db_1.query)(`SELECT * FROM user_personas WHERE user_id = ? AND is_active = 1 LIMIT 1`, [userId]);
        return rows[0] || null;
    }
    static async upsertPersona(userId, data) {
        const existing = await this.getPersonaByUserId(userId);
        if (existing) {
            await (0, db_1.query)(`UPDATE user_personas SET
          persona_name = COALESCE(?, persona_name),
          communication_style = COALESCE(?, communication_style),
          preferred_people = COALESCE(?, preferred_people),
          networking_goal = COALESCE(?, networking_goal),
          interests = COALESCE(?, interests),
          confidence = COALESCE(?, confidence)
        WHERE persona_id = ? AND user_id = ?`, [
                data.persona_name ?? null,
                data.communication_style ?? null,
                data.preferred_people ?? null,
                data.networking_goal ?? null,
                data.interests ?? null,
                data.confidence ?? null,
                existing.persona_id,
                userId,
            ]);
        }
        else {
            await (0, db_1.query)(`INSERT INTO user_personas (
          user_id, persona_name, communication_style, preferred_people, networking_goal, interests, confidence, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`, [
                userId,
                data.persona_name || 'My Networking Persona',
                data.communication_style || 'Concise & Strategic',
                data.preferred_people || 'Domain Leaders & Founders',
                data.networking_goal || 'Build meaningful professional relationships',
                data.interests || 'Tech & AI',
                data.confidence || 85,
            ]);
        }
    }
}
exports.ProfileRepository = ProfileRepository;
