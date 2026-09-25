"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const response_1 = require("../helpers/response");
const UserRepository_1 = require("../repositories/UserRepository");
const db_1 = require("../config/db");
class UploadController {
    static async uploadAvatar(req, res, next) {
        try {
            const userId = req.user.userId;
            const { imageBase64 } = req.body;
            if (!imageBase64 || typeof imageBase64 !== 'string') {
                return (0, response_1.sendError)(res, 'No image data provided', 400, 'IMAGE_REQUIRED');
            }
            // Extract mime type and base64 data
            const matches = imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
            let base64Data = imageBase64;
            let ext = 'png';
            if (matches) {
                const mimeType = matches[1];
                base64Data = matches[2];
                ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'png';
            }
            const filename = `avatar-${userId}-${Date.now()}.${ext}`;
            const targetDirs = [
                path_1.default.join(process.cwd(), 'uploads/avatars'),
                path_1.default.join(process.cwd(), 'public/uploads/avatars'),
                path_1.default.join(__dirname, '../../uploads/avatars'),
                path_1.default.join(__dirname, '../public/uploads/avatars'),
                path_1.default.join(__dirname, '../../public/uploads/avatars'),
            ];
            const buffer = Buffer.from(base64Data, 'base64');
            for (const dir of targetDirs) {
                try {
                    if (!fs_1.default.existsSync(dir)) {
                        fs_1.default.mkdirSync(dir, { recursive: true });
                    }
                    await fs_1.default.promises.writeFile(path_1.default.join(dir, filename), buffer);
                }
                catch {
                    // ignore error for secondary targets
                }
            }
            const avatarUrl = `/uploads/avatars/${filename}`;
            // Immediately update database user, profile, and post avatar references
            await UserRepository_1.UserRepository.updateAvatar(userId, avatarUrl);
            await (0, db_1.query)(`UPDATE user_profiles SET avatar_url = ? WHERE user_id = ?`, [avatarUrl, userId]);
            await (0, db_1.query)(`UPDATE posts SET author_avatar = ? WHERE user_id = ?`, [avatarUrl, userId]);
            return (0, response_1.sendSuccess)(res, { avatarUrl });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.UploadController = UploadController;
