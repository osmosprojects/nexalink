import { Request, Response, NextFunction } from 'express';
import { AnalyticsRepository } from '../repositories/AnalyticsRepository';
import { TaskRepository } from '../repositories/TaskRepository';
import { MeetingRepository } from '../repositories/MeetingRepository';
import { ContactRepository } from '../repositories/ContactRepository';
import { RecommendationRepository } from '../repositories/RecommendationRepository';
import { AIService } from '../services/AIService';
import { GoalRepository } from '../repositories/GoalRepository';
import { InteractionRepository } from '../repositories/InteractionRepository';
import { sendSuccess } from '../helpers/response';

export class DashboardController {
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const [
        stats,
        tasks,
        upcomingMeetings,
        followUps,
        recommendations,
        aiInsights,
        goals,
        recentInteractions,
      ] = await Promise.all([
        AnalyticsRepository.getDashboardStats(userId),
        TaskRepository.list(userId, { status: 'todo' }),
        MeetingRepository.list(userId, { upcoming_only: true, limit: 5 }),
        ContactRepository.list(userId, { follow_up_due: true, limit: 5 }),
        RecommendationRepository.list(userId, 'pending'),
        AIService.getRelationshipInsights(userId),
        GoalRepository.list(userId, 'active'),
        InteractionRepository.list(userId, { limit: 5 }),
      ]);

      return sendSuccess(res, {
        stats,
        tasks: tasks.slice(0, 5),
        upcoming_meetings: upcomingMeetings,
        follow_ups: followUps.items,
        recommendations: recommendations.slice(0, 3),
        ai_insights: aiInsights,
        goals: goals.slice(0, 3),
        recent_interactions: recentInteractions.items,
      });
    } catch (err) {
      next(err);
    }
  }
}
