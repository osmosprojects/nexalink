"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIController = void 0;
const AIService_1 = require("../services/AIService");
const response_1 = require("../helpers/response");
const audit_1 = require("../middleware/audit");
class AIController {
    static async getConversationSuggestions(req, res, next) {
        try {
            const userId = req.user.userId;
            const { contact_id, goal } = req.body;
            if (!contact_id)
                return (0, response_1.sendError)(res, 'Contact ID is required', 400);
            const suggestions = await AIService_1.AIService.getConversationSuggestions(userId, parseInt(contact_id, 10), goal);
            await (0, audit_1.logAudit)(req, 'AI_CONVERSATION_SUGGESTION', 'contact', contact_id);
            return (0, response_1.sendSuccess)(res, suggestions);
        }
        catch (err) {
            next(err);
        }
    }
    static async draftMessage(req, res, next) {
        try {
            const userId = req.user.userId;
            const { contact_id, purpose, tone, context } = req.body;
            if (!contact_id)
                return (0, response_1.sendError)(res, 'Contact ID is required', 400);
            const draftResult = await AIService_1.AIService.draftMessage(userId, {
                contact_id: parseInt(contact_id, 10),
                purpose: purpose || 'follow_up',
                tone: tone || 'professional',
                context,
            });
            await (0, audit_1.logAudit)(req, 'AI_MESSAGE_DRAFTED', 'contact', contact_id, { purpose, tone });
            return (0, response_1.sendSuccess)(res, draftResult);
        }
        catch (err) {
            next(err);
        }
    }
    static async summarizeMeeting(req, res, next) {
        try {
            const userId = req.user.userId;
            const { meeting_title, notes, contact_id } = req.body;
            if (!notes)
                return (0, response_1.sendError)(res, 'Meeting notes are required for summarization', 400);
            const summaryResult = await AIService_1.AIService.summarizeMeeting(userId, {
                meeting_title,
                notes,
                contact_id: contact_id ? parseInt(contact_id, 10) : undefined,
            });
            await (0, audit_1.logAudit)(req, 'AI_MEETING_SUMMARIZED', 'meeting', null);
            return (0, response_1.sendSuccess)(res, summaryResult);
        }
        catch (err) {
            next(err);
        }
    }
    static async getInsights(req, res, next) {
        try {
            const userId = req.user.userId;
            const insights = await AIService_1.AIService.getRelationshipInsights(userId);
            return (0, response_1.sendSuccess)(res, insights);
        }
        catch (err) {
            next(err);
        }
    }
    static async getGoalSuggestions(req, res, next) {
        try {
            const userId = req.user.userId;
            const suggestions = await AIService_1.AIService.suggestGoals(userId);
            return (0, response_1.sendSuccess)(res, suggestions);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.AIController = AIController;
