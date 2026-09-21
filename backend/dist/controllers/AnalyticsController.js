"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const AnalyticsRepository_1 = require("../repositories/AnalyticsRepository");
const response_1 = require("../helpers/response");
class AnalyticsController {
    static async getOverview(req, res, next) {
        try {
            const userId = req.user.userId;
            const analytics = await AnalyticsRepository_1.AnalyticsRepository.getFullAnalytics(userId);
            return (0, response_1.sendSuccess)(res, analytics);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.AnalyticsController = AnalyticsController;
