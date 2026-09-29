import { Request, Response, NextFunction } from 'express';
import { ContactRepository } from '../repositories/ContactRepository';
import { TagRepository } from '../repositories/TagRepository';
import { InteractionRepository } from '../repositories/InteractionRepository';
import { MeetingRepository } from '../repositories/MeetingRepository';
import { TaskRepository } from '../repositories/TaskRepository';
import { NoteRepository } from '../repositories/NoteRepository';
import { UserRepository } from '../repositories/UserRepository';
import { ProfileRepository } from '../repositories/ProfileRepository';
import { FeedRepository } from '../repositories/FeedRepository';
import { query } from '../config/db';
import { sendSuccess, sendError } from '../helpers/response';
import { logAudit } from '../middleware/audit';

export class ContactController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      // Auto-synchronize Hot/Warm/Cold warmth tags
      await TagRepository.syncContactWarmth(userId);

      const {
        search,
        relationship_type,
        tag,
        company,
        follow_up_due,
        sort_by,
        sort_order,
        page,
        limit,
      } = req.query;

      const result = await ContactRepository.list(userId, {
        search: search as string,
        relationship_type: relationship_type as string,
        tag: tag as string,
        company: company as string,
        follow_up_due: follow_up_due === 'true',
        sort_by: sort_by as any,
        sort_order: sort_order as any,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });

      return sendSuccess(res, result.items, 200, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const contactId = parseInt(String(req.params.id), 10);
      if (isNaN(contactId)) return sendError(res, 'Invalid contact ID', 400);

      const contact = await ContactRepository.getById(userId, contactId);
      if (!contact) return sendError(res, 'Contact not found', 404);

      // Fetch related interactions, meetings, tasks, notes
      const [interactions, meetings, tasks, notes] = await Promise.all([
        InteractionRepository.list(userId, { contact_id: contactId, limit: 20 }),
        MeetingRepository.list(userId, { contact_id: contactId }),
        TaskRepository.list(userId, { contact_id: contactId }),
        NoteRepository.list(userId, { contact_id: contactId }),
      ]);

      return sendSuccess(res, {
        contact,
        interactions: interactions.items,
        meetings,
        tasks,
        notes,
      });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { first_name, last_name, email, phone, company, job_title, location, website, linkedin_url, avatar_url, relationship_type, relationship_strength, next_follow_up_at, notes, tagNames } = req.body;

      if (!first_name && !last_name) {
        return sendError(res, 'Name is required', 400);
      }

      const safeFirstName = first_name || last_name || 'Connection';
      const safeLastName = first_name && last_name ? last_name : '';

      const contactId = await ContactRepository.create(userId, {
        first_name: safeFirstName,
        last_name: safeLastName,
        email,
        phone,
        company,
        job_title,
        location,
        website,
        linkedin_url,
        avatar_url,
        relationship_type,
        relationship_strength,
        next_follow_up_at,
        notes,
        tagNames,
      });

      await TagRepository.syncContactWarmth(userId, contactId);
      const isPublicVal = Boolean(req.body.is_public || req.body.isPublic || (req.body.privacyTag && req.body.privacyTag.includes('Public')) || (tagNames && Array.isArray(tagNames) && tagNames.some((t: string) => t.includes('Public'))));
      await TagRepository.setContactPrivacy(userId, contactId, isPublicVal);

      if (isPublicVal) {
        try {
          const user = await UserRepository.findById(userId);
          const profile = await ProfileRepository.getProfileByUserId(userId);
          const authorTitle = profile?.headline || (profile?.job_title && profile?.company ? `${profile.job_title} at ${profile.company}` : profile?.job_title || profile?.company || 'Network Member');
          const targetDetails = `${safeFirstName}${safeLastName ? ` ${safeLastName}` : ''}${job_title ? `, ${job_title}` : ''}${company ? `, ${company}` : ''}`;
          const postContent = `[can connect you to] ${targetDetails}`;

          await FeedRepository.create(userId, {
            author_name: user?.display_name || 'Connection Owner',
            author_title: authorTitle,
            author_avatar: user?.avatar_url || null,
            content: postContent,
            tags: null,
          });
        } catch (feedErr) {
          console.warn('Auto feed post error during contact creation:', feedErr);
        }
      }

      const contact = await ContactRepository.getById(userId, contactId);
      await logAudit(req, 'CONTACT_CREATED', 'contact', contactId);

      return sendSuccess(res, contact, 201);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const contactId = parseInt(String(req.params.id), 10);
      if (isNaN(contactId)) return sendError(res, 'Invalid contact ID', 400);

      const existing = await ContactRepository.getById(userId, contactId);
      if (!existing) return sendError(res, 'Contact not found', 404);

      await ContactRepository.update(userId, contactId, req.body);

      if (req.body.warmthTag || req.body.warmth) {
        const warmthVal = req.body.warmthTag || req.body.warmth;
        await TagRepository.setContactWarmth(userId, contactId, warmthVal);
      }

      if (req.body.privacyTag !== undefined || req.body.is_public !== undefined || req.body.isPublic !== undefined) {
        const isPub = req.body.privacyTag ? req.body.privacyTag.includes('Public') : Boolean(req.body.is_public || req.body.isPublic);
        await TagRepository.setContactPrivacy(userId, contactId, isPub);

        // RULE: If changed to Public from CRM, auto-post connection to Network Feed!
        if (isPub) {
          try {
            const contact = await ContactRepository.getById(userId, contactId);
            if (contact) {
              const user = await UserRepository.findById(userId);
              const profile = await ProfileRepository.getProfileByUserId(userId);
              const authorTitle = profile?.headline || (profile?.job_title && profile?.company ? `${profile.job_title} at ${profile.company}` : profile?.job_title || profile?.company || 'Network Member');
              const last = contact.last_name && contact.last_name !== '.' ? ` ${contact.last_name}` : '';
              const nameStr = `${contact.first_name || ''}${last}`.trim();
              const targetDetails = `${nameStr}${contact.job_title ? `, ${contact.job_title}` : ''}${contact.company ? `, ${contact.company}` : ''}`;
              const postContent = `[can connect you to] ${targetDetails}`;

              const existingPosts = await query<any[]>(
                `SELECT post_id FROM posts WHERE user_id = ? AND content LIKE ? LIMIT 1`,
                [userId, `%${nameStr}%`]
              );

              if (existingPosts.length === 0) {
                await FeedRepository.create(userId, {
                  author_name: user?.display_name || 'Connection Owner',
                  author_title: authorTitle,
                  author_avatar: user?.avatar_url || null,
                  content: postContent,
                  tags: null,
                });
              }
            }
          } catch (feedErr) {
            console.warn('Auto feed post error during contact update:', feedErr);
          }
        }
      }

      const updated = await ContactRepository.getById(userId, contactId);
      await logAudit(req, 'CONTACT_UPDATED', 'contact', contactId);

      return sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const contactId = parseInt(String(req.params.id), 10);
      if (isNaN(contactId)) return sendError(res, 'Invalid contact ID', 400);

      const deleted = await ContactRepository.delete(userId, contactId);
      if (!deleted) return sendError(res, 'Contact not found or could not be deleted', 404);

      await logAudit(req, 'CONTACT_DELETED', 'contact', contactId);

      return sendSuccess(res, { message: 'Contact deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  static async getTags(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const tags = await TagRepository.listByUserId(userId);
      return sendSuccess(res, tags);
    } catch (err) {
      next(err);
    }
  }
}
