"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalController = void 0;
const GoalRepository_1 = require("../repositories/GoalRepository");
const response_1 = require("../helpers/response");
const audit_1 = require("../middleware/audit");
class GoalController {
    static async list(req, res, next) {
        try {
            const userId = req.user.userId;
            const { status } = req.query;
            const goals = await GoalRepository_1.GoalRepository.list(userId, status);
            return (0, response_1.sendSuccess)(res, goals);
        }
        catch (err) {
            next(err);
        }
    }
    static async getById(req, res, next) {
        try {
            const userId = req.user.userId;
            const goalId = parseInt(String(req.params.id), 10);
            if (isNaN(goalId))
                return (0, response_1.sendError)(res, 'Invalid goal ID', 400);
            const goal = await GoalRepository_1.GoalRepository.getById(userId, goalId);
            if (!goal)
                return (0, response_1.sendError)(res, 'Goal not found', 404);
            return (0, response_1.sendSuccess)(res, goal);
        }
        catch (err) {
            next(err);
        }
    }
    static async create(req, res, next) {
        try {
            const userId = req.user.userId;
            const { title, description, goal_type, target_value, current_value, unit, start_date, end_date, status } = req.body;
            if (!title)
                return (0, response_1.sendError)(res, 'Title is required', 400);
            const goalId = await GoalRepository_1.GoalRepository.create(userId, {
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
            const goal = await GoalRepository_1.GoalRepository.getById(userId, goalId);
            await (0, audit_1.logAudit)(req, 'GOAL_CREATED', 'goal', goalId);
            return (0, response_1.sendSuccess)(res, goal, 201);
        }
        catch (err) {
            next(err);
        }
    }
    static async update(req, res, next) {
        try {
            const userId = req.user.userId;
            const goalId = parseInt(String(req.params.id), 10);
            if (isNaN(goalId))
                return (0, response_1.sendError)(res, 'Invalid goal ID', 400);
            await GoalRepository_1.GoalRepository.update(userId, goalId, req.body);
            const updated = await GoalRepository_1.GoalRepository.getById(userId, goalId);
            await (0, audit_1.logAudit)(req, 'GOAL_UPDATED', 'goal', goalId);
            return (0, response_1.sendSuccess)(res, updated);
        }
        catch (err) {
            next(err);
        }
    }
    static async logProgress(req, res, next) {
        try {
            const userId = req.user.userId;
            const goalId = parseInt(String(req.params.id), 10);
            if (isNaN(goalId))
                return (0, response_1.sendError)(res, 'Invalid goal ID', 400);
            const { increment_value, notes } = req.body;
            await GoalRepository_1.GoalRepository.logProgress(userId, goalId, {
                increment_value: increment_value ? parseInt(increment_value, 10) : 1,
                notes,
            });
            const updated = await GoalRepository_1.GoalRepository.getById(userId, goalId);
            await (0, audit_1.logAudit)(req, 'GOAL_PROGRESS_LOGGED', 'goal', goalId);
            return (0, response_1.sendSuccess)(res, updated);
        }
        catch (err) {
            next(err);
        }
    }
    static async delete(req, res, next) {
        try {
            const userId = req.user.userId;
            const goalId = parseInt(String(req.params.id), 10);
            if (isNaN(goalId))
                return (0, response_1.sendError)(res, 'Invalid goal ID', 400);
            const deleted = await GoalRepository_1.GoalRepository.delete(userId, goalId);
            if (!deleted)
                return (0, response_1.sendError)(res, 'Goal not found', 404);
            await (0, audit_1.logAudit)(req, 'GOAL_DELETED', 'goal', goalId);
            return (0, response_1.sendSuccess)(res, { message: 'Goal deleted successfully' });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.GoalController = GoalController;
