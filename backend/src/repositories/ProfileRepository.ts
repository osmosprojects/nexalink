import { query } from '../config/db';

export interface UserProfileRow {
  profile_id: number;
  user_id: number;
  headline: string | null;
  bio: string | null;
  company: string | null;
  job_title: string | null;
  location: string | null;
  industry: string | null;
  website: string | null;
  linkedin_url: string | null;
  phone: string | null;
  timezone: string;
  avatar_url: string | null;
  skills: any;
  interests: any;
  networking_goals: any;
  created_at: string;
  updated_at: string;
}

export interface UserPersonaRow {
  persona_id: number;
  user_id: number;
  persona_name: string;
  communication_style: string;
  preferred_people: string | null;
  networking_goal: string | null;
  interests: string | null;
  confidence: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export class ProfileRepository {
  static async getProfileByUserId(userId: number): Promise<UserProfileRow | null> {
    const rows = await query<UserProfileRow[]>(
      `SELECT * FROM user_profiles WHERE user_id = ? LIMIT 1`,
      [userId]
    );
    if (!rows[0]) return null;
    const row = rows[0];
    return {
      ...row,
      skills: typeof row.skills === 'string' ? JSON.parse(row.skills) : row.skills || [],
      interests: typeof row.interests === 'string' ? JSON.parse(row.interests) : row.interests || [],
      networking_goals: typeof row.networking_goals === 'string' ? JSON.parse(row.networking_goals) : row.networking_goals || [],
    };
  }

  static async upsertProfile(userId: number, data: Partial<UserProfileRow>): Promise<void> {
    const existing = await this.getProfileByUserId(userId);
    const skillsJson = data.skills ? JSON.stringify(data.skills) : JSON.stringify([]);
    const interestsJson = data.interests ? JSON.stringify(data.interests) : JSON.stringify([]);
    const goalsJson = data.networking_goals ? JSON.stringify(data.networking_goals) : JSON.stringify([]);

    if (existing) {
      await query(
        `UPDATE user_profiles SET
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
        WHERE user_id = ?`,
        [
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
        ]
      );
    } else {
      await query(
        `INSERT INTO user_profiles (
          user_id, headline, bio, company, job_title, location, industry, website, linkedin_url, phone, timezone, avatar_url, skills, interests, networking_goals
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
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
        ]
      );
    }
  }

  static async getPersonaByUserId(userId: number): Promise<UserPersonaRow | null> {
    const rows = await query<UserPersonaRow[]>(
      `SELECT * FROM user_personas WHERE user_id = ? AND is_active = 1 LIMIT 1`,
      [userId]
    );
    return rows[0] || null;
  }

  static async upsertPersona(userId: number, data: Partial<UserPersonaRow>): Promise<void> {
    const existing = await this.getPersonaByUserId(userId);
    if (existing) {
      await query(
        `UPDATE user_personas SET
          persona_name = COALESCE(?, persona_name),
          communication_style = COALESCE(?, communication_style),
          preferred_people = COALESCE(?, preferred_people),
          networking_goal = COALESCE(?, networking_goal),
          interests = COALESCE(?, interests),
          confidence = COALESCE(?, confidence)
        WHERE persona_id = ? AND user_id = ?`,
        [
          data.persona_name ?? null,
          data.communication_style ?? null,
          data.preferred_people ?? null,
          data.networking_goal ?? null,
          data.interests ?? null,
          data.confidence ?? null,
          existing.persona_id,
          userId,
        ]
      );
    } else {
      await query(
        `INSERT INTO user_personas (
          user_id, persona_name, communication_style, preferred_people, networking_goal, interests, confidence, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          userId,
          data.persona_name || 'My Networking Persona',
          data.communication_style || 'Concise & Strategic',
          data.preferred_people || 'Domain Leaders & Founders',
          data.networking_goal || 'Build meaningful professional relationships',
          data.interests || 'Tech & AI',
          data.confidence || 85,
        ]
      );
    }
  }
}
