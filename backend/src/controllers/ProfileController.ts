import { Request, Response, NextFunction } from 'express';
import { ProfileRepository } from '../repositories/ProfileRepository';
import { UserRepository } from '../repositories/UserRepository';
import { sendSuccess, sendError } from '../helpers/response';
import { logAudit } from '../middleware/audit';

export class ProfileController {
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const profile = await ProfileRepository.getProfileByUserId(userId);
      const persona = await ProfileRepository.getPersonaByUserId(userId);
      const user = await UserRepository.findById(userId);

      return sendSuccess(res, {
        user: {
          userId: user?.user_id,
          email: user?.email,
          displayName: user?.display_name,
          avatarUrl: user?.avatar_url,
        },
        profile,
        persona,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data = req.body;

      if (data.name && typeof data.name === 'string') {
        await UserRepository.updateName(userId, data.name);
      }
      if (data.avatar_url) {
        await UserRepository.updateAvatar(userId, data.avatar_url);
      }

      await ProfileRepository.upsertProfile(userId, {
        bio: data.bio,
        phone: data.phone,
        website: data.website || data.socialLinks?.website,
        linkedin_url: data.linkedin || data.socialLinks?.linkedin,
        avatar_url: data.avatar_url || null,
        skills: {
          twitter: data.twitter,
          networkingGroup: data.networkingGroup,
          hobbies: data.hobbies || [],
          interests: data.userInterests || data.interestsList || [],
          socialLinks: data.socialLinks,
        },
        networking_goals: data.targetBusinesses || data.networking_goals || [],
        interests: data.connectionsOffered || data.interests || [],
        headline: data.bio ? data.bio.slice(0, 100) : null,
      });
      const updated = await ProfileRepository.getProfileByUserId(userId);

      await logAudit(req, 'PROFILE_UPDATED', 'profile', userId);

      return sendSuccess(res, { profile: updated });
    } catch (err) {
      next(err);
    }
  }

  static async updatePersona(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data = req.body;

      await ProfileRepository.upsertPersona(userId, data);
      const persona = await ProfileRepository.getPersonaByUserId(userId);

      await logAudit(req, 'PERSONA_UPDATED', 'persona', userId);

      return sendSuccess(res, { persona });
    } catch (err) {
      next(err);
    }
  }
}
