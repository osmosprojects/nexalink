"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingController = void 0;
const MeetingRepository_1 = require("../repositories/MeetingRepository");
const response_1 = require("../helpers/response");
const audit_1 = require("../middleware/audit");
class MeetingController {
    static async list(req, res, next) {
        try {
            const userId = req.user.userId;
            const { contact_id, upcoming_only, limit } = req.query;
            const meetings = await MeetingRepository_1.MeetingRepository.list(userId, {
                contact_id: contact_id ? parseInt(contact_id, 10) : undefined,
                upcoming_only: upcoming_only === 'true',
                limit: limit ? parseInt(limit, 10) : undefined,
            });
            return (0, response_1.sendSuccess)(res, meetings);
        }
        catch (err) {
            next(err);
        }
    }
    static async getById(req, res, next) {
        try {
            const userId = req.user.userId;
            const meetingId = parseInt(String(req.params.id), 10);
            if (isNaN(meetingId))
                return (0, response_1.sendError)(res, 'Invalid meeting ID', 400);
            const meeting = await MeetingRepository_1.MeetingRepository.getById(userId, meetingId);
            if (!meeting)
                return (0, response_1.sendError)(res, 'Meeting not found', 404);
            return (0, response_1.sendSuccess)(res, meeting);
        }
        catch (err) {
            next(err);
        }
    }
    static async create(req, res, next) {
        try {
            const userId = req.user.userId;
            const { contact_id, goal_id, title, meeting_type, start_at, end_at, location, meeting_url, agenda, outcome, notes, follow_up_date } = req.body;
            if (!title || !start_at || !end_at) {
                return (0, response_1.sendError)(res, 'Title, start time, and end time are required', 400);
            }
            const meetingId = await MeetingRepository_1.MeetingRepository.create(userId, {
                contact_id: contact_id ? parseInt(contact_id, 10) : null,
                goal_id: goal_id ? parseInt(goal_id, 10) : null,
                title,
                meeting_type,
                start_at,
                end_at,
                location,
                meeting_url,
                agenda,
                outcome,
                notes,
                follow_up_date,
            });
            const meeting = await MeetingRepository_1.MeetingRepository.getById(userId, meetingId);
            await (0, audit_1.logAudit)(req, 'MEETING_SCHEDULED', 'meeting', meetingId);
            return (0, response_1.sendSuccess)(res, meeting, 201);
        }
        catch (err) {
            next(err);
        }
    }
    static async update(req, res, next) {
        try {
            const userId = req.user.userId;
            const meetingId = parseInt(String(req.params.id), 10);
            if (isNaN(meetingId))
                return (0, response_1.sendError)(res, 'Invalid meeting ID', 400);
            await MeetingRepository_1.MeetingRepository.update(userId, meetingId, req.body);
            const updated = await MeetingRepository_1.MeetingRepository.getById(userId, meetingId);
            await (0, audit_1.logAudit)(req, 'MEETING_UPDATED', 'meeting', meetingId);
            return (0, response_1.sendSuccess)(res, updated);
        }
        catch (err) {
            next(err);
        }
    }
    static async delete(req, res, next) {
        try {
            const userId = req.user.userId;
            const meetingId = parseInt(String(req.params.id), 10);
            if (isNaN(meetingId))
                return (0, response_1.sendError)(res, 'Invalid meeting ID', 400);
            const deleted = await MeetingRepository_1.MeetingRepository.delete(userId, meetingId);
            if (!deleted)
                return (0, response_1.sendError)(res, 'Meeting not found', 404);
            await (0, audit_1.logAudit)(req, 'MEETING_DELETED', 'meeting', meetingId);
            return (0, response_1.sendSuccess)(res, { message: 'Meeting deleted successfully' });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.MeetingController = MeetingController;
