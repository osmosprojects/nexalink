import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { sendSuccess, sendError } from '../helpers/response';

export class UploadController {
  static async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { imageBase64 } = req.body;

      if (!imageBase64 || typeof imageBase64 !== 'string') {
        return sendError(res, 'No image data provided', 400, 'IMAGE_REQUIRED');
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
        path.join(process.cwd(), 'uploads/avatars'),
        path.join(process.cwd(), 'public/uploads/avatars'),
        path.join(__dirname, '../../uploads/avatars'),
        path.join(__dirname, '../public/uploads/avatars'),
        path.join(__dirname, '../../public/uploads/avatars'),
      ];

      const buffer = Buffer.from(base64Data, 'base64');

      for (const dir of targetDirs) {
        try {
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          await fs.promises.writeFile(path.join(dir, filename), buffer);
        } catch {
          // ignore error for secondary directory targets
        }
      }

      const avatarUrl = `/uploads/avatars/${filename}`;

      return sendSuccess(res, { avatarUrl });
    } catch (err) {
      next(err);
    }
  }
}
