"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedController = void 0;
const FeedRepository_1 = require("../repositories/FeedRepository");
const UserRepository_1 = require("../repositories/UserRepository");
const response_1 = require("../helpers/response");
const audit_1 = require("../middleware/audit");
class FeedController {
    static async list(req, res, next) {
        try {
            const userId = req.user.userId;
            const posts = await FeedRepository_1.FeedRepository.list(userId, 30);
            return (0, response_1.sendSuccess)(res, posts);
        }
        catch (err) {
            next(err);
        }
    }
    static async create(req, res, next) {
        try {
            const userId = req.user.userId;
            const { content, tags } = req.body;
            if (!content)
                return (0, response_1.sendError)(res, 'Content is required', 400);
            const user = await UserRepository_1.UserRepository.findById(userId);
            const postId = await FeedRepository_1.FeedRepository.create(userId, {
                author_name: user?.display_name || 'User',
                author_title: 'NexaLink Network Member',
                author_avatar: user?.avatar_url || null,
                content,
                tags: tags || [],
            });
            await (0, audit_1.logAudit)(req, 'FEED_POST_CREATED', 'post', postId);
            return (0, response_1.sendSuccess)(res, { postId, message: 'Post published to networking feed' }, 201);
        }
        catch (err) {
            next(err);
        }
    }
    static async like(req, res, next) {
        try {
            const userId = req.user.userId;
            const postId = parseInt(String(req.params.id), 10);
            await FeedRepository_1.FeedRepository.like(userId, postId);
            return (0, response_1.sendSuccess)(res, { message: 'Post liked' });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.FeedController = FeedController;
