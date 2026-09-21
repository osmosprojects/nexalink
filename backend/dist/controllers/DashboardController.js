"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const AnalyticsRepository_1 = require("../repositories/AnalyticsRepository");
const TaskRepository_1 = require("../repositories/TaskRepository");
const MeetingRepository_1 = require("../repositories/MeetingRepository");
const ContactRepository_1 = require("../repositories/ContactRepository");
const RecommendationRepository_1 = require("../repositories/RecommendationRepository");
const AIService_1 = require("../services/AIService");
const GoalRepository_1 = require("../repositories/GoalRepository");
const InteractionRepository_1 = require("../repositories/InteractionRepository");
const response_1 = require("../helpers/response");
class DashboardController {
    static async getDashboard(req, res, next) {
        try {
            const userId = req.user.userId;
            const [stats, tasks, upcomingMeetings, followUps, recommendations, aiInsights, goals, recentInteractions,] = await Promise.all([
                AnalyticsRepository_1.AnalyticsRepository.getDashboardStats(userId),
                TaskRepository_1.TaskRepository.list(userId, { status: 'todo' }),
                MeetingRepository_1.MeetingRepository.list(userId, { upcoming_only: true, limit: 5 }),
                ContactRepository_1.ContactRepository.list(userId, { follow_up_due: true, limit: 5 }),
                RecommendationRepository_1.RecommendationRepository.list(userId, 'pending'),
                AIService_1.AIService.getRelationshipInsights(userId),
                GoalRepository_1.GoalRepository.list(userId, 'active'),
                InteractionRepository_1.InteractionRepository.list(userId, { limit: 5 }),
            ]);
            return (0, response_1.sendSuccess)(res, {
                stats,
                tasks: tasks.slice(0, 5),
                upcoming_meetings: upcomingMeetings,
                follow_ups: followUps.items,
                recommendations: recommendations.slice(0, 3),
                ai_insights: aiInsights,
                goals: goals.slice(0, 3),
                recent_interactions: recentInteractions.items,
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.DashboardController = DashboardController;
