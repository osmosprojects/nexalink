import { Request, Response, NextFunction } from 'express';
import { NoteRepository } from '../repositories/NoteRepository';
import { sendSuccess, sendError } from '../helpers/response';
import { logAudit } from '../middleware/audit';

export class NoteController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { contact_id, search } = req.query;

      const notes = await NoteRepository.list(userId, {
        contact_id: contact_id ? parseInt(contact_id as string, 10) : undefined,
        search: search as string,
      });

      return sendSuccess(res, notes);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const noteId = parseInt(String(req.params.id), 10);
      if (isNaN(noteId)) return sendError(res, 'Invalid note ID', 400);

      const note = await NoteRepository.getById(userId, noteId);
      if (!note) return sendError(res, 'Note not found', 404);

      return sendSuccess(res, note);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { title, content, is_pinned, contact_id, meeting_id, goal_id, task_id } = req.body;

      if (!title || !content) return sendError(res, 'Title and content are required', 400);

      const noteId = await NoteRepository.create(userId, {
        title,
        content,
        is_pinned: is_pinned ? 1 : 0,
        contact_id: contact_id ? parseInt(contact_id, 10) : null,
        meeting_id: meeting_id ? parseInt(meeting_id, 10) : null,
        goal_id: goal_id ? parseInt(goal_id, 10) : null,
        task_id: task_id ? parseInt(task_id, 10) : null,
      });

      const note = await NoteRepository.getById(userId, noteId);
      await logAudit(req, 'NOTE_CREATED', 'note', noteId);

      return sendSuccess(res, note, 201);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const noteId = parseInt(String(req.params.id), 10);
      if (isNaN(noteId)) return sendError(res, 'Invalid note ID', 400);

      await NoteRepository.update(userId, noteId, req.body);
      const updated = await NoteRepository.getById(userId, noteId);

      await logAudit(req, 'NOTE_UPDATED', 'note', noteId);

      return sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const noteId = parseInt(String(req.params.id), 10);
      if (isNaN(noteId)) return sendError(res, 'Invalid note ID', 400);

      const deleted = await NoteRepository.delete(userId, noteId);
      if (!deleted) return sendError(res, 'Note not found', 404);

      await logAudit(req, 'NOTE_DELETED', 'note', noteId);

      return sendSuccess(res, { message: 'Note deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}
