import { Request, Response, NextFunction } from 'express';
import { FeedRepository } from '../repositories/FeedRepository';
import { UserRepository } from '../repositories/UserRepository';
import { ProfileRepository } from '../repositories/ProfileRepository';
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
      const { replyType, targetPerson } = req.body;

      const user = await UserRepository.findById(userId);

      const replyId = await FeedRepository.createReply(
        userId,
        postId,
        user?.display_name || 'User',
        user?.avatar_url || null,
        replyType || 'wants to meet to',
        targetPerson || 'Sanjeev Sarma',
        null
      );

      await logAudit(req, 'FEED_REPLY_CREATED', 'reply', replyId);
      return sendSuccess(res, { replyId, message: 'Reply added to thread' }, 201);
    } catch (err) {
      next(err);
    }
  }
}
