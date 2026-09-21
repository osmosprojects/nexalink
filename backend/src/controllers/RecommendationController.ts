import { Request, Response, NextFunction } from 'express';
import { RecommendationRepository } from '../repositories/RecommendationRepository';
import { ContactRepository } from '../repositories/ContactRepository';
import { sendSuccess, sendError } from '../helpers/response';
import { logAudit } from '../middleware/audit';

export class RecommendationController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { status } = req.query;

      const recommendations = await RecommendationRepository.list(userId, (status as string) || 'pending');
      return sendSuccess(res, recommendations);
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const recommendationId = parseInt(String(req.params.id), 10);
      const { status } = req.body;

      if (!status) return sendError(res, 'Status is required', 400);

      await RecommendationRepository.updateStatus(userId, recommendationId, status);
      await logAudit(req, 'RECOMMENDATION_STATUS_CHANGED', 'recommendation', recommendationId, { status });

      return sendSuccess(res, { message: `Recommendation marked as ${status}` });
    } catch (err) {
      next(err);
    }
  }

  static async convertToContact(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const recommendationId = parseInt(String(req.params.id), 10);

      const recs = await RecommendationRepository.list(userId, 'pending');
      const rec = recs.find((r) => r.recommendation_id === recommendationId);
      if (!rec) return sendError(res, 'Recommendation not found', 404);

      const nameParts = rec.recommended_name.split(' ');
      const firstName = nameParts[0] || rec.recommended_name;
      const lastName = nameParts.slice(1).join(' ') || '';

      const contactId = await ContactRepository.create(userId, {
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

      await RecommendationRepository.updateStatus(userId, recommendationId, 'connected');
      await logAudit(req, 'RECOMMENDATION_CONVERTED_TO_CONTACT', 'contact', contactId);

      const contact = await ContactRepository.getById(userId, contactId);
      return sendSuccess(res, contact, 201);
    } catch (err) {
      next(err);
    }
  }
}
