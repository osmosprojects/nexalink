import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';
import { ProfileRepository } from '../repositories/ProfileRepository';
import { MatchmakingService } from '../services/MatchmakingService';
import { query } from '../config/db';
import { config } from '../config/env';
import { sendSuccess, sendError } from '../helpers/response';
import { logAudit } from '../middleware/audit';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, displayName } = req.body;
      if (!email || !password || !displayName) {
        return sendError(res, 'Email, password, and display name are required', 400);
      }

      const existing = await UserRepository.findByEmail(email);
      if (existing) {
        return sendError(res, 'An account with this email already exists', 409, 'EMAIL_EXISTS');
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = await UserRepository.create({
        email,
        passwordHash,
        displayName,
      });

      // Initialize default profile and persona
      await ProfileRepository.upsertProfile(userId, {
        headline: 'Professional & Builder',
        bio: 'Welcome to NexaLink CRM!',
      });
      await ProfileRepository.upsertPersona(userId, {
        persona_name: 'Strategic Networker',
        communication_style: 'Concise & Strategic',
      });

      const token = jwt.sign(
        { userId, email, displayName },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      await logAudit(req, 'USER_REGISTERED', 'user', userId);

      MatchmakingService.processProfileMatches(userId).catch((err) =>
        console.error('Matchmaking trigger on register error:', err)
      );

      const isComplete = await ProfileRepository.isProfileComplete(userId);
      return sendSuccess(res, {
        user: { userId, email, displayName, avatarUrl: null },
        token,
        isProfileComplete: isComplete,
      }, 201);
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return sendError(res, 'Email and password are required', 400);
      }

      const user = await UserRepository.findByEmail(email);
      if (!user || !user.password_hash) {
        return sendError(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return sendError(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      const token = jwt.sign(
        { userId: user.user_id, email: user.email, displayName: user.display_name },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      await logAudit(req, 'USER_LOGIN', 'user', user.user_id);
      const isComplete = await ProfileRepository.isProfileComplete(user.user_id);

      return sendSuccess(res, {
        user: {
          userId: user.user_id,
          email: user.email,
          displayName: user.display_name,
          avatarUrl: user.avatar_url,
        },
        token,
        isProfileComplete: isComplete,
      });
    } catch (err) {
      next(err);
    }
  }

  static async demoLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await query<any[]>('SELECT * FROM users WHERE status = ? ORDER BY user_id ASC LIMIT 1', ['active']);
      const user = users && users.length > 0 ? users[0] : null;
      if (!user) {
        return sendError(res, 'No active user account found in database.', 404);
      }

      const token = jwt.sign(
        { userId: user.user_id, email: user.email, displayName: user.display_name },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      await logAudit(req, 'DEMO_LOGIN', 'user', user.user_id);
      const isComplete = await ProfileRepository.isProfileComplete(user.user_id);

      return sendSuccess(res, {
        user: {
          userId: user.user_id,
          email: user.email,
          displayName: user.display_name,
          avatarUrl: user.avatar_url,
        },
        token,
        isProfileComplete: isComplete,
      });
    } catch (err) {
      next(err);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const user = await UserRepository.findById(userId);
      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      const profile = await ProfileRepository.getProfileByUserId(userId);
      const persona = await ProfileRepository.getPersonaByUserId(userId);
      const isComplete = await ProfileRepository.isProfileComplete(userId);

      return sendSuccess(res, {
        user: {
          userId: user.user_id,
          email: user.email,
          displayName: user.display_name,
          avatarUrl: user.avatar_url,
          status: user.status,
          createdAt: user.created_at,
        },
        profile,
        persona,
        isProfileComplete: isComplete,
      });
    } catch (err) {
      next(err);
    }
  }

  static async googleAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const { credential, token, googleUser } = req.body;
      let email = googleUser?.email;
      let displayName = googleUser?.name || googleUser?.displayName;
      let avatarUrl = googleUser?.picture || googleUser?.avatarUrl;

      // Verify Google ID token if provided
      const idToken = credential || token;
      if (idToken) {
        try {
          const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
          if (googleRes.ok) {
            const payload: any = await googleRes.json();
            if (payload.email) {
              email = payload.email;
              displayName = payload.name || payload.given_name || displayName;
              avatarUrl = payload.picture || avatarUrl;
            }
          }
        } catch (verifyErr) {
          console.warn('Google id_token validation fallback to payload:', verifyErr);
        }
      }

      if (!email || typeof email !== 'string') {
        return sendError(res, 'Google authentication failed: Valid email required', 400);
      }

      let user = await UserRepository.findByEmail(email);

      if (!user) {
        const userId = await UserRepository.create({
          email,
          passwordHash: null,
          displayName: displayName || email.split('@')[0],
        });

        if (avatarUrl) {
          await query('UPDATE users SET avatar_url = ? WHERE user_id = ?', [avatarUrl, userId]);
        }

        await ProfileRepository.upsertProfile(userId, {
          headline: 'Professional Networker',
          bio: 'Welcome to NexaLink CRM!',
          avatar_url: avatarUrl || null,
        });

        await ProfileRepository.upsertPersona(userId, {
          persona_name: 'Strategic Networker',
          communication_style: 'Concise & Strategic',
        });

        user = await UserRepository.findById(userId);
      } else {
        if (avatarUrl && !user.avatar_url) {
          await query('UPDATE users SET avatar_url = ? WHERE user_id = ?', [avatarUrl, user.user_id]);
          user.avatar_url = avatarUrl;
        }
        if (displayName && user.display_name !== displayName) {
          await query('UPDATE users SET display_name = ? WHERE user_id = ?', [displayName, user.user_id]);
          user.display_name = displayName;
        }
      }

      if (!user) {
        return sendError(res, 'User account creation or fetch failed', 500);
      }

      const jwtToken = jwt.sign(
        { userId: user.user_id, email: user.email, displayName: user.display_name },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      res.cookie('token', jwtToken, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      await logAudit(req, 'GOOGLE_OAUTH_LOGIN', 'user', user.user_id);
      const isComplete = await ProfileRepository.isProfileComplete(user.user_id);

      return sendSuccess(res, {
        user: {
          userId: user.user_id,
          email: user.email,
          displayName: user.display_name,
          avatarUrl: user.avatar_url,
        },
        token: jwtToken,
        isProfileComplete: isComplete,
      });
    } catch (err) {
      next(err);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('token');
      await logAudit(req, 'USER_LOGOUT', 'user', req.user?.userId || null);
      return sendSuccess(res, { message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  }
}
