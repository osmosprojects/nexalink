import { Request, Response, NextFunction } from 'express';
import { GoalRepository } from '../repositories/GoalRepository';
import { sendSuccess, sendError } from '../helpers/response';
import { logAudit } from '../middleware/audit';

export class GoalController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { status } = req.query;

      const goals = await GoalRepository.list(userId, status as string);
      return sendSuccess(res, goals);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const goalId = parseInt(String(req.params.id), 10);
      if (isNaN(goalId)) return sendError(res, 'Invalid goal ID', 400);

      const goal = await GoalRepository.getById(userId, goalId);
      if (!goal) return sendError(res, 'Goal not found', 404);

      return sendSuccess(res, goal);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { title, description, goal_type, target_value, current_value, unit, start_date, end_date, status } = req.body;

      if (!title) return sendError(res, 'Title is required', 400);

      const goalId = await GoalRepository.create(userId, {
        title,
        description,
        goal_type: goal_type || 'connections',
        target_value: target_value ? parseInt(target_value, 10) : 10,
        current_value: current_value ? parseInt(current_value, 10) : 0,
        unit: unit || 'people',
        start_date,
        end_date,
        status: status || 'active',
      });

      const goal = await GoalRepository.getById(userId, goalId);
      await logAudit(req, 'GOAL_CREATED', 'goal', goalId);

      return sendSuccess(res, goal, 201);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const goalId = parseInt(String(req.params.id), 10);
      if (isNaN(goalId)) return sendError(res, 'Invalid goal ID', 400);

      await GoalRepository.update(userId, goalId, req.body);
      const updated = await GoalRepository.getById(userId, goalId);

      await logAudit(req, 'GOAL_UPDATED', 'goal', goalId);

      return sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  }

  static async logProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const goalId = parseInt(String(req.params.id), 10);
      if (isNaN(goalId)) return sendError(res, 'Invalid goal ID', 400);

      const { increment_value, notes } = req.body;
      await GoalRepository.logProgress(userId, goalId, {
        increment_value: increment_value ? parseInt(increment_value, 10) : 1,
        notes,
      });

      const updated = await GoalRepository.getById(userId, goalId);
      await logAudit(req, 'GOAL_PROGRESS_LOGGED', 'goal', goalId);

      return sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const goalId = parseInt(String(req.params.id), 10);
      if (isNaN(goalId)) return sendError(res, 'Invalid goal ID', 400);

      const deleted = await GoalRepository.delete(userId, goalId);
      if (!deleted) return sendError(res, 'Goal not found', 404);

      await logAudit(req, 'GOAL_DELETED', 'goal', goalId);

      return sendSuccess(res, { message: 'Goal deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}
