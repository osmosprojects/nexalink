"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationController = void 0;
const RecommendationRepository_1 = require("../repositories/RecommendationRepository");
const ContactRepository_1 = require("../repositories/ContactRepository");
const UserMatchScoreRepository_1 = require("../repositories/UserMatchScoreRepository");
const MatchmakingService_1 = require("../services/MatchmakingService");
const response_1 = require("../helpers/response");
const audit_1 = require("../middleware/audit");
class RecommendationController {
    static async list(req, res, next) {
        try {
            const userId = req.user.userId;
            const { status, view } = req.query;
            // If view=discover, use precomputed discovery with 1-in-5 diversity injection
            if (view === 'discover') {
                const matches = await MatchmakingService_1.MatchmakingService.getDiscoverFeed(userId);
                return (0, response_1.sendSuccess)(res, matches);
            }
            let recommendations = await RecommendationRepository_1.RecommendationRepository.list(userId, status || 'pending');
            if (recommendations.length === 0) {
                await MatchmakingService_1.MatchmakingService.processProfileMatches(userId);
                recommendations = await RecommendationRepository_1.RecommendationRepository.list(userId, status || 'pending');
            }
            return (0, response_1.sendSuccess)(res, recommendations);
        }
        catch (err) {
            next(err);
        }
    }
    static async skipProfile(req, res, next) {
        try {
            const userId = req.user.userId;
            const skippedUserId = parseInt(String(req.params.skippedUserId), 10);
            if (!skippedUserId || isNaN(skippedUserId)) {
                return (0, response_1.sendError)(res, 'Valid skippedUserId is required', 400);
            }
            await UserMatchScoreRepository_1.UserMatchScoreRepository.recordSkip(userId, skippedUserId);
            await (0, audit_1.logAudit)(req, 'RECOMMENDATION_SKIPPED', 'user', skippedUserId);
            return (0, response_1.sendSuccess)(res, { message: 'Profile dismissed from recommendations' });
        }
        catch (err) {
            next(err);
        }
    }
    static async updateStatus(req, res, next) {
        try {
            const userId = req.user.userId;
            const recommendationId = parseInt(String(req.params.id), 10);
            const { status } = req.body;
            if (!status)
                return (0, response_1.sendError)(res, 'Status is required', 400);
            await RecommendationRepository_1.RecommendationRepository.updateStatus(userId, recommendationId, status);
            await (0, audit_1.logAudit)(req, 'RECOMMENDATION_STATUS_CHANGED', 'recommendation', recommendationId, { status });
            return (0, response_1.sendSuccess)(res, { message: `Recommendation marked as ${status}` });
        }
        catch (err) {
            next(err);
        }
    }
    static async convertToContact(req, res, next) {
        try {
            const userId = req.user.userId;
            const recommendationId = parseInt(String(req.params.id), 10);
            const recs = await RecommendationRepository_1.RecommendationRepository.list(userId, 'pending');
            const rec = recs.find((r) => r.recommendation_id === recommendationId);
            if (!rec)
                return (0, response_1.sendError)(res, 'Recommendation not found', 404);
            const nameParts = rec.recommended_name.split(' ');
            const firstName = nameParts[0] || rec.recommended_name;
            const lastName = nameParts.slice(1).join(' ') || '';
            const contactId = await ContactRepository_1.ContactRepository.create(userId, {
                first_name: firstName,
                last_name: lastName,
                company: rec.recommended_company,
                job_title: rec.recommended_role,
                avatar_url: rec.avatar_url,
                relationship_type: 'prospect',
                relationship_strength: rec.score,
                notes: `Discovered through NexaLink Recommendation: ${rec.reason}`,
                tagNames: ['Discovery', rec.industry || 'Tech'].filter(Boolean),
            });
            await RecommendationRepository_1.RecommendationRepository.updateStatus(userId, recommendationId, 'connected');
            await (0, audit_1.logAudit)(req, 'RECOMMENDATION_CONVERTED_TO_CONTACT', 'contact', contactId);
            const contact = await ContactRepository_1.ContactRepository.getById(userId, contactId);
            return (0, response_1.sendSuccess)(res, contact, 201);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.RecommendationController = RecommendationController;
