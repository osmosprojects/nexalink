import { Request, Response, NextFunction } from 'express';
import { ProfileRepository } from '../repositories/ProfileRepository';
import { UserRepository } from '../repositories/UserRepository';
import { MatchmakingService } from '../services/MatchmakingService';
import { sendSuccess, sendError } from '../helpers/response';
import { logAudit } from '../middleware/audit';

export class ProfileController {
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const profile = await ProfileRepository.getProfileByUserId(userId);
      const persona = await ProfileRepository.getPersonaByUserId(userId);
      const user = await UserRepository.findById(userId);

      const isComplete = await ProfileRepository.isProfileComplete(userId);
      return sendSuccess(res, {
        user: {
          userId: user?.user_id,
          email: user?.email,
          displayName: user?.display_name,
          avatarUrl: user?.avatar_url,
        },
        profile,
        persona,
        isProfileComplete: isComplete,
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
      if (data.avatar_url !== undefined) {
        await UserRepository.updateAvatar(userId, data.avatar_url || '');
      }

      const companyName = data.company || data.brandName || data.brand_name || null;
      const roleName = data.job_title || data.role || null;
      const domainName = data.industry || data.domain || null;
      const servicesBio = data.bio || data.servicesOffered || data.services_offered || null;

      await ProfileRepository.upsertProfile(userId, {
        bio: servicesBio,
        company: companyName,
        job_title: roleName,
        industry: domainName,
        phone: data.phone,
        website: data.website || data.socialLinks?.website,
        linkedin_url: data.linkedin || data.socialLinks?.linkedin,
        avatar_url: data.avatar_url || null,
        skills: {
          company: companyName,
          role: roleName,
          domain: domainName,
          servicesOffered: servicesBio,
          networkingGroup: data.networkingGroup,
          hobbies: data.hobbies || [],
          interests: data.userInterests || data.interestsList || [],
          goals: data.goals || data.userGoals || [],
          networkingTargetPeriod: data.networkingTargetPeriod || 'week',
          networkingNewConnections: data.networkingNewConnections ?? 10,
          currentCity: data.currentCity || '',
          targetCities: data.targetCities || [],
          socialLinks: {
            linkedin: data.linkedin || data.socialLinks?.linkedin,
            instagram: data.instagram || data.socialLinks?.instagram,
            website: data.website || data.socialLinks?.website,
          },
        },
        networking_goals: data.targetBusinesses || data.networking_goals || [],
        interests: data.connectionsOffered || data.interests || [],
        headline: roleName && companyName ? `${roleName} at ${companyName}` : servicesBio ? servicesBio.slice(0, 100) : null,
      });

      const updatedProfile = await ProfileRepository.getProfileByUserId(userId);
      const updatedUser = await UserRepository.findById(userId);
      const isComplete = await ProfileRepository.isProfileComplete(userId);

      // Trigger Matchmaking & Event-Driven Notification Engine in background
      MatchmakingService.processProfileMatches(userId).catch((err) =>
        console.error('Matchmaking trigger error:', err)
      );

      await logAudit(req, 'PROFILE_UPDATED', 'profile', userId);

      return sendSuccess(res, {
        profile: updatedProfile,
        user: {
          userId: updatedUser?.user_id,
          email: updatedUser?.email,
          displayName: updatedUser?.display_name,
          avatarUrl: updatedUser?.avatar_url,
        },
        isProfileComplete: isComplete,
      });
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
