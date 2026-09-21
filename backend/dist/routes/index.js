"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const ProfileController_1 = require("../controllers/ProfileController");
const ContactController_1 = require("../controllers/ContactController");
const InteractionController_1 = require("../controllers/InteractionController");
const MeetingController_1 = require("../controllers/MeetingController");
const GoalController_1 = require("../controllers/GoalController");
const TaskController_1 = require("../controllers/TaskController");
const NoteController_1 = require("../controllers/NoteController");
const RecommendationController_1 = require("../controllers/RecommendationController");
const FeedController_1 = require("../controllers/FeedController");
const AIController_1 = require("../controllers/AIController");
const AnalyticsController_1 = require("../controllers/AnalyticsController");
const NotificationController_1 = require("../controllers/NotificationController");
const SearchController_1 = require("../controllers/SearchController");
const DashboardController_1 = require("../controllers/DashboardController");
const auth_1 = require("../middleware/auth");
const requireProfile_1 = require("../middleware/requireProfile");
exports.apiRouter = (0, express_1.Router)();
// Health Check
exports.apiRouter.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'NexaLink CRM API', time: new Date().toISOString() });
});
// Auth Routes (Public)
exports.apiRouter.post('/auth/register', AuthController_1.AuthController.register);
exports.apiRouter.post('/auth/login', AuthController_1.AuthController.login);
exports.apiRouter.post('/auth/demo-login', AuthController_1.AuthController.demoLogin);
exports.apiRouter.post('/auth/logout', AuthController_1.AuthController.logout);
// Protected Routes (Require Auth Middleware)
exports.apiRouter.use(auth_1.authMiddleware);
// Auth Me (Allowed during onboarding)
exports.apiRouter.get('/auth/me', AuthController_1.AuthController.me);
// Profile & Persona (Allowed during onboarding to complete profile)
exports.apiRouter.get('/profile', ProfileController_1.ProfileController.getProfile);
exports.apiRouter.put('/profile', ProfileController_1.ProfileController.updateProfile);
exports.apiRouter.put('/profile/persona', ProfileController_1.ProfileController.updatePersona);
// GATED MODULES: All endpoints below strictly require a complete Profile & Persona
exports.apiRouter.use(requireProfile_1.requireProfileCompleteMiddleware);
// Dashboard Aggregated
exports.apiRouter.get('/dashboard', DashboardController_1.DashboardController.getDashboard);
// Global Search
exports.apiRouter.get('/search', SearchController_1.SearchController.search);
// Contacts
exports.apiRouter.get('/contacts', ContactController_1.ContactController.list);
exports.apiRouter.post('/contacts', ContactController_1.ContactController.create);
exports.apiRouter.get('/contacts/tags', ContactController_1.ContactController.getTags);
exports.apiRouter.get('/contacts/:id', ContactController_1.ContactController.getById);
exports.apiRouter.put('/contacts/:id', ContactController_1.ContactController.update);
exports.apiRouter.delete('/contacts/:id', ContactController_1.ContactController.delete);
// Interactions
exports.apiRouter.get('/interactions', InteractionController_1.InteractionController.list);
exports.apiRouter.post('/interactions', InteractionController_1.InteractionController.create);
exports.apiRouter.get('/interactions/:id', InteractionController_1.InteractionController.getById);
exports.apiRouter.put('/interactions/:id', InteractionController_1.InteractionController.update);
exports.apiRouter.delete('/interactions/:id', InteractionController_1.InteractionController.delete);
// Meetings
exports.apiRouter.get('/meetings', MeetingController_1.MeetingController.list);
exports.apiRouter.post('/meetings', MeetingController_1.MeetingController.create);
exports.apiRouter.get('/meetings/:id', MeetingController_1.MeetingController.getById);
exports.apiRouter.put('/meetings/:id', MeetingController_1.MeetingController.update);
exports.apiRouter.delete('/meetings/:id', MeetingController_1.MeetingController.delete);
// Goals
exports.apiRouter.get('/goals', GoalController_1.GoalController.list);
exports.apiRouter.post('/goals', GoalController_1.GoalController.create);
exports.apiRouter.get('/goals/:id', GoalController_1.GoalController.getById);
exports.apiRouter.put('/goals/:id', GoalController_1.GoalController.update);
exports.apiRouter.delete('/goals/:id', GoalController_1.GoalController.delete);
exports.apiRouter.post('/goals/:id/progress', GoalController_1.GoalController.logProgress);
// Productivity - Tasks & Kanban
exports.apiRouter.get('/tasks', TaskController_1.TaskController.list);
exports.apiRouter.post('/tasks', TaskController_1.TaskController.create);
exports.apiRouter.get('/tasks/:id', TaskController_1.TaskController.getById);
exports.apiRouter.put('/tasks/:id', TaskController_1.TaskController.update);
exports.apiRouter.patch('/tasks/:id', TaskController_1.TaskController.update);
exports.apiRouter.delete('/tasks/:id', TaskController_1.TaskController.delete);
// Productivity - Notes
exports.apiRouter.get('/notes', NoteController_1.NoteController.list);
exports.apiRouter.post('/notes', NoteController_1.NoteController.create);
exports.apiRouter.get('/notes/:id', NoteController_1.NoteController.getById);
exports.apiRouter.put('/notes/:id', NoteController_1.NoteController.update);
exports.apiRouter.delete('/notes/:id', NoteController_1.NoteController.delete);
// AI Assistant Endpoints
exports.apiRouter.post('/ai/conversation/suggestions', AIController_1.AIController.getConversationSuggestions);
exports.apiRouter.post('/ai/message/draft', AIController_1.AIController.draftMessage);
exports.apiRouter.post('/ai/meeting/summarize', AIController_1.AIController.summarizeMeeting);
exports.apiRouter.get('/ai/insights', AIController_1.AIController.getInsights);
exports.apiRouter.get('/ai/goals/suggestions', AIController_1.AIController.getGoalSuggestions);
// Recommendations & Discovery
exports.apiRouter.get('/recommendations', RecommendationController_1.RecommendationController.list);
exports.apiRouter.post('/recommendations/:id/status', RecommendationController_1.RecommendationController.updateStatus);
exports.apiRouter.post('/recommendations/:id/convert', RecommendationController_1.RecommendationController.convertToContact);
// Networking Feed
exports.apiRouter.get('/feed', FeedController_1.FeedController.list);
exports.apiRouter.post('/feed', FeedController_1.FeedController.create);
exports.apiRouter.post('/feed/:id/like', FeedController_1.FeedController.like);
// Analytics
exports.apiRouter.get('/analytics', AnalyticsController_1.AnalyticsController.getOverview);
// Notifications
exports.apiRouter.get('/notifications', NotificationController_1.NotificationController.list);
exports.apiRouter.post('/notifications/:id/read', NotificationController_1.NotificationController.markAsRead);
exports.apiRouter.post('/notifications/read-all', NotificationController_1.NotificationController.markAllAsRead);
