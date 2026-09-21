import { Request, Response, NextFunction } from 'express';
import { MeetingRepository } from '../repositories/MeetingRepository';
import { sendSuccess, sendError } from '../helpers/response';
import { logAudit } from '../middleware/audit';

export class MeetingController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { contact_id, upcoming_only, limit } = req.query;

      const meetings = await MeetingRepository.list(userId, {
        contact_id: contact_id ? parseInt(contact_id as string, 10) : undefined,
        upcoming_only: upcoming_only === 'true',
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      return sendSuccess(res, meetings);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const meetingId = parseInt(String(req.params.id), 10);
      if (isNaN(meetingId)) return sendError(res, 'Invalid meeting ID', 400);

      const meeting = await MeetingRepository.getById(userId, meetingId);
      if (!meeting) return sendError(res, 'Meeting not found', 404);

      return sendSuccess(res, meeting);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { contact_id, goal_id, title, meeting_type, start_at, end_at, location, meeting_url, agenda, outcome, notes, follow_up_date } = req.body;

      if (!title || !start_at || !end_at) {
        return sendError(res, 'Title, start time, and end time are required', 400);
      }

      const meetingId = await MeetingRepository.create(userId, {
        contact_id: contact_id ? parseInt(contact_id, 10) : null,
        goal_id: goal_id ? parseInt(goal_id, 10) : null,
        title,
        meeting_type,
        start_at,
        end_at,
        location,
        meeting_url,
        agenda,
        outcome,
        notes,
        follow_up_date,
      });

      const meeting = await MeetingRepository.getById(userId, meetingId);
      await logAudit(req, 'MEETING_SCHEDULED', 'meeting', meetingId);

      return sendSuccess(res, meeting, 201);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const meetingId = parseInt(String(req.params.id), 10);
      if (isNaN(meetingId)) return sendError(res, 'Invalid meeting ID', 400);

      await MeetingRepository.update(userId, meetingId, req.body);
      const updated = await MeetingRepository.getById(userId, meetingId);

      await logAudit(req, 'MEETING_UPDATED', 'meeting', meetingId);

      return sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const meetingId = parseInt(String(req.params.id), 10);
      if (isNaN(meetingId)) return sendError(res, 'Invalid meeting ID', 400);

      const deleted = await MeetingRepository.delete(userId, meetingId);
      if (!deleted) return sendError(res, 'Meeting not found', 404);

      await logAudit(req, 'MEETING_DELETED', 'meeting', meetingId);

      return sendSuccess(res, { message: 'Meeting deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}
