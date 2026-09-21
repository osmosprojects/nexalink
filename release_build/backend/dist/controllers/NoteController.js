"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoteController = void 0;
const NoteRepository_1 = require("../repositories/NoteRepository");
const response_1 = require("../helpers/response");
const audit_1 = require("../middleware/audit");
class NoteController {
    static async list(req, res, next) {
        try {
            const userId = req.user.userId;
            const { contact_id, search } = req.query;
            const notes = await NoteRepository_1.NoteRepository.list(userId, {
                contact_id: contact_id ? parseInt(contact_id, 10) : undefined,
                search: search,
            });
            return (0, response_1.sendSuccess)(res, notes);
        }
        catch (err) {
            next(err);
        }
    }
    static async getById(req, res, next) {
        try {
            const userId = req.user.userId;
            const noteId = parseInt(String(req.params.id), 10);
            if (isNaN(noteId))
                return (0, response_1.sendError)(res, 'Invalid note ID', 400);
            const note = await NoteRepository_1.NoteRepository.getById(userId, noteId);
            if (!note)
                return (0, response_1.sendError)(res, 'Note not found', 404);
            return (0, response_1.sendSuccess)(res, note);
        }
        catch (err) {
            next(err);
        }
    }
    static async create(req, res, next) {
        try {
            const userId = req.user.userId;
            const { title, content, is_pinned, contact_id, meeting_id, goal_id, task_id } = req.body;
            if (!title || !content)
                return (0, response_1.sendError)(res, 'Title and content are required', 400);
            const noteId = await NoteRepository_1.NoteRepository.create(userId, {
                title,
                content,
                is_pinned: is_pinned ? 1 : 0,
                contact_id: contact_id ? parseInt(contact_id, 10) : null,
                meeting_id: meeting_id ? parseInt(meeting_id, 10) : null,
                goal_id: goal_id ? parseInt(goal_id, 10) : null,
                task_id: task_id ? parseInt(task_id, 10) : null,
            });
            const note = await NoteRepository_1.NoteRepository.getById(userId, noteId);
            await (0, audit_1.logAudit)(req, 'NOTE_CREATED', 'note', noteId);
            return (0, response_1.sendSuccess)(res, note, 201);
        }
        catch (err) {
            next(err);
        }
    }
    static async update(req, res, next) {
        try {
            const userId = req.user.userId;
            const noteId = parseInt(String(req.params.id), 10);
            if (isNaN(noteId))
                return (0, response_1.sendError)(res, 'Invalid note ID', 400);
            await NoteRepository_1.NoteRepository.update(userId, noteId, req.body);
            const updated = await NoteRepository_1.NoteRepository.getById(userId, noteId);
            await (0, audit_1.logAudit)(req, 'NOTE_UPDATED', 'note', noteId);
            return (0, response_1.sendSuccess)(res, updated);
        }
        catch (err) {
            next(err);
        }
    }
    static async delete(req, res, next) {
        try {
            const userId = req.user.userId;
            const noteId = parseInt(String(req.params.id), 10);
            if (isNaN(noteId))
                return (0, response_1.sendError)(res, 'Invalid note ID', 400);
            const deleted = await NoteRepository_1.NoteRepository.delete(userId, noteId);
            if (!deleted)
                return (0, response_1.sendError)(res, 'Note not found', 404);
            await (0, audit_1.logAudit)(req, 'NOTE_DELETED', 'note', noteId);
            return (0, response_1.sendSuccess)(res, { message: 'Note deleted successfully' });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.NoteController = NoteController;
