import { Request, Response, NextFunction } from 'express';
import { InteractionRepository } from '../repositories/InteractionRepository';
import { sendSuccess, sendError } from '../helpers/response';
import { logAudit } from '../middleware/audit';

export class InteractionController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { contact_id, goal_id, type, limit, page } = req.query;

      const result = await InteractionRepository.list(userId, {
        contact_id: contact_id ? parseInt(contact_id as string, 10) : undefined,
        goal_id: goal_id ? parseInt(goal_id as string, 10) : undefined,
        type: type as string,
        limit: limit ? parseInt(limit as string, 10) : 20,
        page: page ? parseInt(page as string, 10) : 1,
      });

      return sendSuccess(res, result.items, 200, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const interactionId = parseInt(String(req.params.id), 10);
      if (isNaN(interactionId)) return sendError(res, 'Invalid interaction ID', 400);

      const interaction = await InteractionRepository.getById(userId, interactionId);
      if (!interaction) return sendError(res, 'Interaction not found', 404);

      return sendSuccess(res, interaction);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { contact_id, goal_id, interaction_type, title, interaction_date, duration_minutes, summary, outcome, follow_up_required, follow_up_date, sentiment } = req.body;

      if (!contact_id || !title) {
        return sendError(res, 'Contact ID and title are required', 400);
      }

      const interactionId = await InteractionRepository.create(userId, {
        contact_id: parseInt(contact_id, 10),
        goal_id: goal_id ? parseInt(goal_id, 10) : null,
        interaction_type,
        title,
        interaction_date,
        duration_minutes: duration_minutes ? parseInt(duration_minutes, 10) : 30,
        summary,
        outcome,
        follow_up_required,
        follow_up_date,
        sentiment,
      });

      const created = await InteractionRepository.getById(userId, interactionId);
      await logAudit(req, 'INTERACTION_LOGGED', 'interaction', interactionId);

      return sendSuccess(res, created, 201);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const interactionId = parseInt(String(req.params.id), 10);
      if (isNaN(interactionId)) return sendError(res, 'Invalid interaction ID', 400);

      await InteractionRepository.update(userId, interactionId, req.body);
      const updated = await InteractionRepository.getById(userId, interactionId);

      await logAudit(req, 'INTERACTION_UPDATED', 'interaction', interactionId);

      return sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const interactionId = parseInt(String(req.params.id), 10);
      if (isNaN(interactionId)) return sendError(res, 'Invalid interaction ID', 400);

      const deleted = await InteractionRepository.delete(userId, interactionId);
      if (!deleted) return sendError(res, 'Interaction not found', 404);

      await logAudit(req, 'INTERACTION_DELETED', 'interaction', interactionId);

      return sendSuccess(res, { message: 'Interaction deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}
