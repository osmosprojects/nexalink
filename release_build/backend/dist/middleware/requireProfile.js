"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireProfileCompleteMiddleware = requireProfileCompleteMiddleware;
const ProfileRepository_1 = require("../repositories/ProfileRepository");
const response_1 = require("../helpers/response");
async function requireProfileCompleteMiddleware(req, res, next) {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return (0, response_1.sendError)(res, 'Authentication required. Please sign in.', 401, 'UNAUTHORIZED');
        }
        const isComplete = await ProfileRepository_1.ProfileRepository.isProfileComplete(userId);
        if (!isComplete) {
            return (0, response_1.sendError)(res, 'Profile and AI Persona must be completed before accessing this endpoint.', 403, 'PROFILE_INCOMPLETE');
        }
        next();
    }
    catch (error) {
        next(error);
    }
}
