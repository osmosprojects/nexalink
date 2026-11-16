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
      const posts = req.query.view === 'personal'
        ? await FeedRepository.listPersonal(userId)
        : await FeedRepository.list(userId, 30);
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
      const rawPostId = req.params.id || req.query.postId || req.query.id;
      const postId = parseInt(String(rawPostId), 10);

      let targetName = 'Sanjeev Sarma';
      let targetRole = 'CEO';
      let targetCompany = 'Osmos Multimedia Pvt Ltd';

      if (!isNaN(postId)) {
        const post = await FeedRepository.findById(postId);
        if (post) {
          let details = post.content;
          ['[wants to meet]', '[I want to meet]', '[can connect you to]', '[I can connect You to]', '[I can introduce]'].forEach((tag) => {
            details = details.replace(tag, '');
          });
          details = details.trim();

          const parts = details.split(',').map((s) => s.trim());
          if (parts[0]) targetName = parts[0];
          if (parts[1]) targetRole = parts[1];
          if (parts[2]) targetCompany = parts[2];

          // Return only users who actually reacted / replied to this post
          const replies = await FeedRepository.getRepliesForPost(postId);
          const responders = replies.map((r) => ({
            id: `reply-${r.reply_id}`,
            name: r.author_name,
            role: r.reply_type === 'CAN_CONNECT' || r.reply_type === 'can connect' ? 'Responded: Can Connect' : 'Responded: Wants to Meet',
            company: 'Responded to post',
            avatarUrl: r.author_avatar,
            mutualConnectionsCount: 1,
            relationshipStatus: 'Responded to post',
            networkingContext: r.content || `Responded to connect with ${r.target_person}`,
            targetPersonName: targetName,
            userId: r.user_id,
          }));
          return sendSuccess(res, responders);
        }
      }

      return sendSuccess(res, []);
    } catch (err) {
      next(err);
    }
  }
}
