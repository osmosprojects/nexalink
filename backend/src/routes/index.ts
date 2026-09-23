import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { ProfileController } from '../controllers/ProfileController';
import { ContactController } from '../controllers/ContactController';
import { InteractionController } from '../controllers/InteractionController';
import { MeetingController } from '../controllers/MeetingController';
import { GoalController } from '../controllers/GoalController';
import { TaskController } from '../controllers/TaskController';
import { NoteController } from '../controllers/NoteController';
import { RecommendationController } from '../controllers/RecommendationController';
import { FeedController } from '../controllers/FeedController';
import { AIController } from '../controllers/AIController';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { NotificationController } from '../controllers/NotificationController';
import { SearchController } from '../controllers/SearchController';
import { DashboardController } from '../controllers/DashboardController';
import { authMiddleware } from '../middleware/auth';
import { requireProfileCompleteMiddleware } from '../middleware/requireProfile';

export const apiRouter = Router();

// Health Check
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'NexaLink CRM API', time: new Date().toISOString() });
});

// Auth Routes (Public)
apiRouter.post('/auth/register', AuthController.register);
apiRouter.post('/auth/login', AuthController.login);
apiRouter.post('/auth/google', AuthController.googleAuth);
apiRouter.post('/auth/demo-login', AuthController.demoLogin);
apiRouter.post('/auth/logout', AuthController.logout);

import { UploadController } from '../controllers/UploadController';

// Protected Routes (Require Auth Middleware)
apiRouter.use(authMiddleware);

// Auth Me (Allowed during onboarding)
apiRouter.get('/auth/me', AuthController.me);

// File Uploads
apiRouter.post('/upload/avatar', UploadController.uploadAvatar);

// Profile & Persona (Allowed during onboarding to complete profile)
apiRouter.get('/profile', ProfileController.getProfile);
apiRouter.put('/profile', ProfileController.updateProfile);
apiRouter.put('/profile/persona', ProfileController.updatePersona);

// GATED MODULES: All endpoints below strictly require a complete Profile & Persona
apiRouter.use(requireProfileCompleteMiddleware);

// Dashboard Aggregated
apiRouter.get('/dashboard', DashboardController.getDashboard);

// Global Search
apiRouter.get('/search', SearchController.search);

// Contacts
apiRouter.get('/contacts', ContactController.list);
apiRouter.post('/contacts', ContactController.create);
apiRouter.get('/contacts/tags', ContactController.getTags);
apiRouter.get('/contacts/:id', ContactController.getById);
apiRouter.put('/contacts/:id', ContactController.update);
apiRouter.delete('/contacts/:id', ContactController.delete);

// Interactions
apiRouter.get('/interactions', InteractionController.list);
apiRouter.post('/interactions', InteractionController.create);
apiRouter.get('/interactions/:id', InteractionController.getById);
apiRouter.put('/interactions/:id', InteractionController.update);
apiRouter.delete('/interactions/:id', InteractionController.delete);

// Meetings
apiRouter.get('/meetings', MeetingController.list);
apiRouter.post('/meetings', MeetingController.create);
apiRouter.get('/meetings/:id', MeetingController.getById);
apiRouter.put('/meetings/:id', MeetingController.update);
apiRouter.delete('/meetings/:id', MeetingController.delete);

// Goals
apiRouter.get('/goals', GoalController.list);
apiRouter.post('/goals', GoalController.create);
apiRouter.get('/goals/:id', GoalController.getById);
apiRouter.put('/goals/:id', GoalController.update);
apiRouter.delete('/goals/:id', GoalController.delete);
apiRouter.post('/goals/:id/progress', GoalController.logProgress);

// Productivity - Tasks & Kanban
apiRouter.get('/tasks', TaskController.list);
apiRouter.post('/tasks', TaskController.create);
apiRouter.get('/tasks/:id', TaskController.getById);
apiRouter.put('/tasks/:id', TaskController.update);
apiRouter.patch('/tasks/:id', TaskController.update);
apiRouter.delete('/tasks/:id', TaskController.delete);

// Productivity - Notes
apiRouter.get('/notes', NoteController.list);
apiRouter.post('/notes', NoteController.create);
apiRouter.get('/notes/:id', NoteController.getById);
apiRouter.put('/notes/:id', NoteController.update);
apiRouter.delete('/notes/:id', NoteController.delete);

// AI Assistant Endpoints
apiRouter.post('/ai/conversation/suggestions', AIController.getConversationSuggestions);
apiRouter.post('/ai/message/draft', AIController.draftMessage);
apiRouter.post('/ai/meeting/summarize', AIController.summarizeMeeting);
apiRouter.get('/ai/insights', AIController.getInsights);
apiRouter.get('/ai/goals/suggestions', AIController.getGoalSuggestions);

// Recommendations & Discovery
apiRouter.get('/discover', RecommendationController.list);
apiRouter.get('/recommendations', RecommendationController.list);
apiRouter.post('/recommendations/skip/:skippedUserId', RecommendationController.skipProfile);
apiRouter.post('/recommendations/:id/status', RecommendationController.updateStatus);
apiRouter.post('/recommendations/:id/convert', RecommendationController.convertToContact);

// Networking Feed
apiRouter.get('/feed', FeedController.list);
apiRouter.post('/feed', FeedController.create);
apiRouter.post('/feed/:id/like', FeedController.like);

// Analytics
apiRouter.get('/analytics', AnalyticsController.getOverview);

// Notifications
apiRouter.get('/notifications', NotificationController.list);
apiRouter.post('/notifications/:id/read', NotificationController.markAsRead);
apiRouter.post('/notifications/read-all', NotificationController.markAllAsRead);
