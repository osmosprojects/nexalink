"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionController = void 0;
const InteractionRepository_1 = require("../repositories/InteractionRepository");
const response_1 = require("../helpers/response");
const audit_1 = require("../middleware/audit");
class InteractionController {
    static async list(req, res, next) {
        try {
            const userId = req.user.userId;
            const { contact_id, goal_id, type, limit, page } = req.query;
            const result = await InteractionRepository_1.InteractionRepository.list(userId, {
                contact_id: contact_id ? parseInt(contact_id, 10) : undefined,
                goal_id: goal_id ? parseInt(goal_id, 10) : undefined,
                type: type,
                limit: limit ? parseInt(limit, 10) : 20,
                page: page ? parseInt(page, 10) : 1,
            });
            return (0, response_1.sendSuccess)(res, result.items, 200, result.pagination);
        }
        catch (err) {
            next(err);
        }
    }
    static async getById(req, res, next) {
        try {
            const userId = req.user.userId;
            const interactionId = parseInt(String(req.params.id), 10);
            if (isNaN(interactionId))
                return (0, response_1.sendError)(res, 'Invalid interaction ID', 400);
            const interaction = await InteractionRepository_1.InteractionRepository.getById(userId, interactionId);
            if (!interaction)
                return (0, response_1.sendError)(res, 'Interaction not found', 404);
            return (0, response_1.sendSuccess)(res, interaction);
        }
        catch (err) {
            next(err);
        }
    }
    static async create(req, res, next) {
        try {
            const userId = req.user.userId;
            const { contact_id, goal_id, interaction_type, title, interaction_date, duration_minutes, summary, outcome, follow_up_required, follow_up_date, sentiment } = req.body;
            if (!contact_id || !title) {
                return (0, response_1.sendError)(res, 'Contact ID and title are required', 400);
            }
            const interactionId = await InteractionRepository_1.InteractionRepository.create(userId, {
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
            const created = await InteractionRepository_1.InteractionRepository.getById(userId, interactionId);
            await (0, audit_1.logAudit)(req, 'INTERACTION_LOGGED', 'interaction', interactionId);
            return (0, response_1.sendSuccess)(res, created, 201);
        }
        catch (err) {
            next(err);
        }
    }
    static async update(req, res, next) {
        try {
            const userId = req.user.userId;
            const interactionId = parseInt(String(req.params.id), 10);
            if (isNaN(interactionId))
                return (0, response_1.sendError)(res, 'Invalid interaction ID', 400);
            await InteractionRepository_1.InteractionRepository.update(userId, interactionId, req.body);
            const updated = await InteractionRepository_1.InteractionRepository.getById(userId, interactionId);
            await (0, audit_1.logAudit)(req, 'INTERACTION_UPDATED', 'interaction', interactionId);
            return (0, response_1.sendSuccess)(res, updated);
        }
        catch (err) {
            next(err);
        }
    }
    static async delete(req, res, next) {
        try {
            const userId = req.user.userId;
            const interactionId = parseInt(String(req.params.id), 10);
            if (isNaN(interactionId))
                return (0, response_1.sendError)(res, 'Invalid interaction ID', 400);
            const deleted = await InteractionRepository_1.InteractionRepository.delete(userId, interactionId);
            if (!deleted)
                return (0, response_1.sendError)(res, 'Interaction not found', 404);
            await (0, audit_1.logAudit)(req, 'INTERACTION_DELETED', 'interaction', interactionId);
            return (0, response_1.sendSuccess)(res, { message: 'Interaction deleted successfully' });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.InteractionController = InteractionController;
