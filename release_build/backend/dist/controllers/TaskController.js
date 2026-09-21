"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const TaskRepository_1 = require("../repositories/TaskRepository");
const response_1 = require("../helpers/response");
const audit_1 = require("../middleware/audit");
class TaskController {
    static async list(req, res, next) {
        try {
            const userId = req.user.userId;
            const { status, contact_id, goal_id, priority } = req.query;
            const tasks = await TaskRepository_1.TaskRepository.list(userId, {
                status: status,
                contact_id: contact_id ? parseInt(contact_id, 10) : undefined,
                goal_id: goal_id ? parseInt(goal_id, 10) : undefined,
                priority: priority,
            });
            return (0, response_1.sendSuccess)(res, tasks);
        }
        catch (err) {
            next(err);
        }
    }
    static async getById(req, res, next) {
        try {
            const userId = req.user.userId;
            const taskId = parseInt(String(req.params.id), 10);
            if (isNaN(taskId))
                return (0, response_1.sendError)(res, 'Invalid task ID', 400);
            const task = await TaskRepository_1.TaskRepository.getById(userId, taskId);
            if (!task)
                return (0, response_1.sendError)(res, 'Task not found', 404);
            return (0, response_1.sendSuccess)(res, task);
        }
        catch (err) {
            next(err);
        }
    }
    static async create(req, res, next) {
        try {
            const userId = req.user.userId;
            const { title, description, status, priority, due_date, sort_order, contact_id, goal_id } = req.body;
            if (!title)
                return (0, response_1.sendError)(res, 'Title is required', 400);
            const taskId = await TaskRepository_1.TaskRepository.create(userId, {
                title,
                description,
                status: status || 'todo',
                priority: priority || 'medium',
                due_date: due_date || null,
                sort_order: sort_order ?? 0,
                contact_id: contact_id ? parseInt(contact_id, 10) : null,
                goal_id: goal_id ? parseInt(goal_id, 10) : null,
            });
            const task = await TaskRepository_1.TaskRepository.getById(userId, taskId);
            await (0, audit_1.logAudit)(req, 'TASK_CREATED', 'task', taskId);
            return (0, response_1.sendSuccess)(res, task, 201);
        }
        catch (err) {
            next(err);
        }
    }
    static async update(req, res, next) {
        try {
            const userId = req.user.userId;
            const taskId = parseInt(String(req.params.id), 10);
            if (isNaN(taskId))
                return (0, response_1.sendError)(res, 'Invalid task ID', 400);
            await TaskRepository_1.TaskRepository.update(userId, taskId, req.body);
            const updated = await TaskRepository_1.TaskRepository.getById(userId, taskId);
            await (0, audit_1.logAudit)(req, 'TASK_UPDATED', 'task', taskId);
            return (0, response_1.sendSuccess)(res, updated);
        }
        catch (err) {
            next(err);
        }
    }
    static async delete(req, res, next) {
        try {
            const userId = req.user.userId;
            const taskId = parseInt(String(req.params.id), 10);
            if (isNaN(taskId))
                return (0, response_1.sendError)(res, 'Invalid task ID', 400);
            const deleted = await TaskRepository_1.TaskRepository.delete(userId, taskId);
            if (!deleted)
                return (0, response_1.sendError)(res, 'Task not found', 404);
            await (0, audit_1.logAudit)(req, 'TASK_DELETED', 'task', taskId);
            return (0, response_1.sendSuccess)(res, { message: 'Task deleted successfully' });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.TaskController = TaskController;
