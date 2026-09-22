"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const response_1 = require("../helpers/response");
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
            const uploadsDir = path_1.default.join(__dirname, '../../uploads/avatars');
            if (!fs_1.default.existsSync(uploadsDir)) {
                fs_1.default.mkdirSync(uploadsDir, { recursive: true });
            }
            const filePath = path_1.default.join(uploadsDir, filename);
            const buffer = Buffer.from(base64Data, 'base64');
            await fs_1.default.promises.writeFile(filePath, buffer);
            const avatarUrl = `/uploads/avatars/${filename}`;
            return (0, response_1.sendSuccess)(res, { avatarUrl });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.UploadController = UploadController;
