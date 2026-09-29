import { Request, Response, NextFunction } from 'express';
import { FeedRepository } from '../repositories/FeedRepository';
import { UserRepository } from '../repositories/UserRepository';
import { ProfileRepository } from '../repositories/ProfileRepository';
import { ContactRepository } from '../repositories/ContactRepository';
import { query } from '../config/db';
import { sendSuccess, sendError } from '../helpers/response';
import { logAudit } from '../middleware/audit';

export class FeedController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const posts = await FeedRepository.list(userId, 30);
      return sendSuccess(res, posts);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { content, tags } = req.body;

      if (!content) return sendError(res, 'Content is required', 400);

      const user = await UserRepository.findById(userId);
      const profile = await ProfileRepository.getProfileByUserId(userId);

      const authorTitle =
        profile?.headline ||
        (profile?.job_title && profile?.company
          ? `${profile.job_title} at ${profile.company}`
          : profile?.job_title || profile?.company || 'Employee at Osmos Multimedia Pvt Ltd');

      const postId = await FeedRepository.create(userId, {
        author_name: user?.display_name || 'User',
        author_title: authorTitle,
        author_avatar: user?.avatar_url || null,
        content,
        tags: tags || null,
      });

      await logAudit(req, 'FEED_POST_CREATED', 'post', postId);
      return sendSuccess(res, { postId, message: 'Post published to networking feed' }, 201);
    } catch (err) {
      next(err);
    }
  }

  static async like(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const postId = parseInt(String(req.params.id), 10);

      await FeedRepository.like(userId, postId);
      return sendSuccess(res, { message: 'Post liked' });
    } catch (err) {
      next(err);
    }
  }

  static async getReplies(req: Request, res: Response, next: NextFunction) {
    try {
      const postId = parseInt(String(req.params.id), 10);
      const replies = await FeedRepository.getRepliesForPost(postId);
      return sendSuccess(res, replies);
    } catch (err) {
      next(err);
    }
  }

  static async createReply(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const postId = parseInt(String(req.params.id), 10);
      const { replyType, targetPerson, content } = req.body;

      const post = await FeedRepository.findById(postId);
      if (post && post.user_id === userId) {
        return sendError(res, 'You cannot reply to your own post', 400);
      }

      const user = await UserRepository.findById(userId);

      const replyId = await FeedRepository.createReply(
        userId,
        postId,
        user?.display_name || 'User',
        user?.avatar_url || null,
        replyType || 'wants to meet to',
        targetPerson || 'Sanjeev Sarma',
        content || null
      );

      await logAudit(req, 'FEED_REPLY_CREATED', 'reply', replyId);
      return sendSuccess(res, { replyId, message: 'Reply added to thread' }, 201);
    } catch (err) {
      next(err);
    }
  }

  static async getCanConnectPaths(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const postId = parseInt(String(req.params.id), 10);

      if (isNaN(postId)) {
        return sendError(res, 'Invalid post ID', 400);
      }

      const post = await FeedRepository.findById(postId);
      if (!post) {
        return sendError(res, 'Post not found', 404);
      }

      // Extract target person details from post content
      let details = post.content;
      ['[wants to meet]', '[I want to meet]', '[can connect you to]', '[I can connect You to]', '[I can introduce]'].forEach((tag) => {
        details = details.replace(tag, '');
      });
      details = details.trim();

      const parts = details.split(',').map((s) => s.trim());
      const targetName = parts[0] || 'Target Connection';
      const targetRole = parts[1] || '';
      const targetCompany = parts[2] || parts[1] || '';

      // 1. Fetch CRM contacts for introduction paths
      const contactRes = await ContactRepository.list(userId, { limit: 50 });
      const contacts = contactRes.items || [];

      // 2. Fetch Network User Profiles & Matches
      const networkUsers = await query<any[]>(
        `SELECT u.user_id, u.display_name, u.avatar_url, p.job_title, p.company, p.industry, p.location, p.bio
         FROM users u
         JOIN user_profiles p ON u.user_id = p.user_id
         WHERE u.user_id != ? AND u.status = 'active'
         LIMIT 30`,
        [userId]
      );

      const paths: any[] = [];

      contacts.forEach((c: any) => {
        const companyMatch = targetCompany && c.company && c.company.toLowerCase().includes(targetCompany.toLowerCase());
        const roleMatch = targetRole && c.job_title && c.job_title.toLowerCase().includes(targetRole.toLowerCase());
        const isStrong = (c.relationship_strength || 0) >= 50;

        const mutualCount = Math.floor(Math.random() * 4) + 2; // 2-5 mutual connections
        let context = 'CRM Network Contact';
        if (companyMatch) context = `Connected with ${c.company}`;
        else if (roleMatch) context = `Shared ${c.job_title} expertise`;
        else if (isStrong) context = `Strong relationship strength (${c.relationship_strength}%)`;

        paths.push({
          id: `contact-${c.contact_id}`,
          name: `${c.first_name} ${c.last_name}`.trim(),
          role: c.job_title || 'Networking Contact',
          company: c.company || 'NexaLink Partner',
          avatarUrl: c.avatar_url,
          mutualConnectionsCount: mutualCount,
          relationshipStatus: `${mutualCount} mutual connections`,
          networkingContext: context,
          targetPersonName: targetName,
          location: c.location || 'India',
          bio: c.notes || null,
          contactId: c.contact_id,
        });
      });

      networkUsers.forEach((u: any) => {
        const exists = paths.some((p) => p.name.toLowerCase() === u.display_name.toLowerCase());
        if (!exists) {
          const mutualCount = Math.floor(Math.random() * 5) + 1;
          paths.push({
            id: `user-${u.user_id}`,
            name: u.display_name,
            role: u.job_title || 'Network Member',
            company: u.company || 'NexaLink Network',
            avatarUrl: u.avatar_url,
            mutualConnectionsCount: mutualCount,
            relationshipStatus: `${mutualCount} mutual connections`,
            networkingContext: `Active Network Member in ${u.industry || 'Tech'}`,
            targetPersonName: targetName,
            location: u.location || 'India',
            bio: u.bio || null,
            userId: u.user_id,
          });
        }
      });

      return sendSuccess(res, paths);
    } catch (err) {
      next(err);
    }
  }
}
