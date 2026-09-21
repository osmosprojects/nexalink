import { Request, Response, NextFunction } from 'express';
import { TaskRepository } from '../repositories/TaskRepository';
import { sendSuccess, sendError } from '../helpers/response';
import { logAudit } from '../middleware/audit';

export class TaskController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { status, contact_id, goal_id, priority } = req.query;

      const tasks = await TaskRepository.list(userId, {
        status: status as string,
        contact_id: contact_id ? parseInt(contact_id as string, 10) : undefined,
        goal_id: goal_id ? parseInt(goal_id as string, 10) : undefined,
        priority: priority as string,
      });

      return sendSuccess(res, tasks);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const taskId = parseInt(String(req.params.id), 10);
      if (isNaN(taskId)) return sendError(res, 'Invalid task ID', 400);

      const task = await TaskRepository.getById(userId, taskId);
      if (!task) return sendError(res, 'Task not found', 404);

      return sendSuccess(res, task);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { title, description, status, priority, due_date, sort_order, contact_id, goal_id } = req.body;

      if (!title) return sendError(res, 'Title is required', 400);

      const taskId = await TaskRepository.create(userId, {
        title,
        description,
        status: status || 'todo',
        priority: priority || 'medium',
        due_date: due_date || null,
        sort_order: sort_order ?? 0,
        contact_id: contact_id ? parseInt(contact_id, 10) : null,
        goal_id: goal_id ? parseInt(goal_id, 10) : null,
      });

      const task = await TaskRepository.getById(userId, taskId);
      await logAudit(req, 'TASK_CREATED', 'task', taskId);

      return sendSuccess(res, task, 201);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const taskId = parseInt(String(req.params.id), 10);
      if (isNaN(taskId)) return sendError(res, 'Invalid task ID', 400);

      await TaskRepository.update(userId, taskId, req.body);
      const updated = await TaskRepository.getById(userId, taskId);

      await logAudit(req, 'TASK_UPDATED', 'task', taskId);

      return sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const taskId = parseInt(String(req.params.id), 10);
      if (isNaN(taskId)) return sendError(res, 'Invalid task ID', 400);

      const deleted = await TaskRepository.delete(userId, taskId);
      if (!deleted) return sendError(res, 'Task not found', 404);

      await logAudit(req, 'TASK_DELETED', 'task', taskId);

      return sendSuccess(res, { message: 'Task deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}
