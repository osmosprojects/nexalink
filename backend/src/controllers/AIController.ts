import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/AIService';
import { sendSuccess, sendError } from '../helpers/response';
import { logAudit } from '../middleware/audit';

export class AIController {
  static async getConversationSuggestions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { contact_id, goal } = req.body;

      if (!contact_id) return sendError(res, 'Contact ID is required', 400);

      const suggestions = await AIService.getConversationSuggestions(
        userId,
        parseInt(contact_id, 10),
        goal
      );

      await logAudit(req, 'AI_CONVERSATION_SUGGESTION', 'contact', contact_id);
      return sendSuccess(res, suggestions);
    } catch (err) {
      next(err);
    }
  }

  static async draftMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { contact_id, purpose, tone, context } = req.body;

      if (!contact_id) return sendError(res, 'Contact ID is required', 400);

      const draftResult = await AIService.draftMessage(userId, {
        contact_id: parseInt(contact_id, 10),
        purpose: purpose || 'follow_up',
        tone: tone || 'professional',
        context,
      });

      await logAudit(req, 'AI_MESSAGE_DRAFTED', 'contact', contact_id, { purpose, tone });
      return sendSuccess(res, draftResult);
    } catch (err) {
      next(err);
    }
  }

  static async summarizeMeeting(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { meeting_title, notes, contact_id } = req.body;

      if (!notes) return sendError(res, 'Meeting notes are required for summarization', 400);

      const summaryResult = await AIService.summarizeMeeting(userId, {
        meeting_title,
        notes,
        contact_id: contact_id ? parseInt(contact_id, 10) : undefined,
      });

      await logAudit(req, 'AI_MEETING_SUMMARIZED', 'meeting', null);
      return sendSuccess(res, summaryResult);
    } catch (err) {
      next(err);
    }
  }

  static async getInsights(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const insights = await AIService.getRelationshipInsights(userId);
      return sendSuccess(res, insights);
    } catch (err) {
      next(err);
    }
  }

  static async getGoalSuggestions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const suggestions = await AIService.suggestGoals(userId);
      return sendSuccess(res, suggestions);
    } catch (err) {
      next(err);
    }
  }
}
