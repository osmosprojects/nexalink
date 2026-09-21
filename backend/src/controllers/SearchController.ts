import { Request, Response, NextFunction } from 'express';
import { SearchRepository } from '../repositories/SearchRepository';
import { sendSuccess } from '../helpers/response';

export class SearchController {
  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const q = req.query.q as string;

      const results = await SearchRepository.globalSearch(userId, q || '');
      return sendSuccess(res, results);
    } catch (err) {
      next(err);
    }
  }
}
