import { Request, Response, NextFunction } from 'express';
import { ProfileRepository } from '../repositories/ProfileRepository';
import { sendError } from '../helpers/response';

export async function requireProfileCompleteMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, 'Authentication required. Please sign in.', 401, 'UNAUTHORIZED');
    }

    const isComplete = await ProfileRepository.isProfileComplete(userId);
    if (!isComplete) {
      return sendError(
        res,
        'Profile and AI Persona must be completed before accessing this endpoint.',
        403,
        'PROFILE_INCOMPLETE'
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}
