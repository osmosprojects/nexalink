import { Request, Response, NextFunction } from 'express';
import { AnalyticsRepository } from '../repositories/AnalyticsRepository';
import { sendSuccess } from '../helpers/response';

export class AnalyticsController {
  static async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const analytics = await AnalyticsRepository.getFullAnalytics(userId);
      return sendSuccess(res, analytics);
    } catch (err) {
      next(err);
    }
  }
}
