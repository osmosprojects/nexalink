import { Request, Response, NextFunction } from 'express';
import { ContactRepository } from '../repositories/ContactRepository';
import { TagRepository } from '../repositories/TagRepository';
import { InteractionRepository } from '../repositories/InteractionRepository';
import { MeetingRepository } from '../repositories/MeetingRepository';
import { TaskRepository } from '../repositories/TaskRepository';
import { NoteRepository } from '../repositories/NoteRepository';
import { sendSuccess, sendError } from '../helpers/response';
import { logAudit } from '../middleware/audit';

export class ContactController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { search, relationship_type, tag, company, follow_up_due, sort_by, sort_order, page, limit } = req.query;

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

      if (!first_name || !last_name) {
        return sendError(res, 'First name and last name are required', 400);
      }

      const contactId = await ContactRepository.create(userId, {
        first_name,
        last_name,
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
