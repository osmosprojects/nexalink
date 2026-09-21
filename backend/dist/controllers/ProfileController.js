"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileController = void 0;
const ProfileRepository_1 = require("../repositories/ProfileRepository");
const UserRepository_1 = require("../repositories/UserRepository");
const response_1 = require("../helpers/response");
const audit_1 = require("../middleware/audit");
class ProfileController {
    static async getProfile(req, res, next) {
        try {
            const userId = req.user.userId;
            const profile = await ProfileRepository_1.ProfileRepository.getProfileByUserId(userId);
            const persona = await ProfileRepository_1.ProfileRepository.getPersonaByUserId(userId);
            const user = await UserRepository_1.UserRepository.findById(userId);
            return (0, response_1.sendSuccess)(res, {
                user: {
                    userId: user?.user_id,
                    email: user?.email,
                    displayName: user?.display_name,
                    avatarUrl: user?.avatar_url,
                },
                profile,
                persona,
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async updateProfile(req, res, next) {
        try {
            const userId = req.user.userId;
            const data = req.body;
            if (data.avatar_url) {
                await UserRepository_1.UserRepository.updateAvatar(userId, data.avatar_url);
            }
            await ProfileRepository_1.ProfileRepository.upsertProfile(userId, data);
            const updated = await ProfileRepository_1.ProfileRepository.getProfileByUserId(userId);
            await (0, audit_1.logAudit)(req, 'PROFILE_UPDATED', 'profile', userId);
            return (0, response_1.sendSuccess)(res, { profile: updated });
        }
        catch (err) {
            next(err);
        }
    }
    static async updatePersona(req, res, next) {
        try {
            const userId = req.user.userId;
            const data = req.body;
            await ProfileRepository_1.ProfileRepository.upsertPersona(userId, data);
            const persona = await ProfileRepository_1.ProfileRepository.getPersonaByUserId(userId);
            await (0, audit_1.logAudit)(req, 'PERSONA_UPDATED', 'persona', userId);
            return (0, response_1.sendSuccess)(res, { persona });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ProfileController = ProfileController;
