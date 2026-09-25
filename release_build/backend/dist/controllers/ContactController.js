"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactController = void 0;
const ContactRepository_1 = require("../repositories/ContactRepository");
const TagRepository_1 = require("../repositories/TagRepository");
const InteractionRepository_1 = require("../repositories/InteractionRepository");
const MeetingRepository_1 = require("../repositories/MeetingRepository");
const TaskRepository_1 = require("../repositories/TaskRepository");
const NoteRepository_1 = require("../repositories/NoteRepository");
const response_1 = require("../helpers/response");
const audit_1 = require("../middleware/audit");
class ContactController {
    static async list(req, res, next) {
        try {
            const userId = req.user.userId;
            // Auto-synchronize Hot/Warm/Cold warmth tags
            await TagRepository_1.TagRepository.syncContactWarmth(userId);
            const { search, relationship_type, tag, company, follow_up_due, sort_by, sort_order, page, limit, } = req.query;
            const result = await ContactRepository_1.ContactRepository.list(userId, {
                search: search,
                relationship_type: relationship_type,
                tag: tag,
                company: company,
                follow_up_due: follow_up_due === 'true',
                sort_by: sort_by,
                sort_order: sort_order,
                page: page ? parseInt(page, 10) : 1,
                limit: limit ? parseInt(limit, 10) : 20,
            });
            return (0, response_1.sendSuccess)(res, result.items, 200, result.pagination);
        }
        catch (err) {
            next(err);
        }
    }
    static async getById(req, res, next) {
        try {
            const userId = req.user.userId;
            const contactId = parseInt(String(req.params.id), 10);
            if (isNaN(contactId))
                return (0, response_1.sendError)(res, 'Invalid contact ID', 400);
            const contact = await ContactRepository_1.ContactRepository.getById(userId, contactId);
            if (!contact)
                return (0, response_1.sendError)(res, 'Contact not found', 404);
            // Fetch related interactions, meetings, tasks, notes
            const [interactions, meetings, tasks, notes] = await Promise.all([
                InteractionRepository_1.InteractionRepository.list(userId, { contact_id: contactId, limit: 20 }),
                MeetingRepository_1.MeetingRepository.list(userId, { contact_id: contactId }),
                TaskRepository_1.TaskRepository.list(userId, { contact_id: contactId }),
                NoteRepository_1.NoteRepository.list(userId, { contact_id: contactId }),
            ]);
            return (0, response_1.sendSuccess)(res, {
                contact,
                interactions: interactions.items,
                meetings,
                tasks,
                notes,
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async create(req, res, next) {
        try {
            const userId = req.user.userId;
            const { first_name, last_name, email, phone, company, job_title, location, website, linkedin_url, avatar_url, relationship_type, relationship_strength, next_follow_up_at, notes, tagNames } = req.body;
            if (!first_name || !last_name) {
                return (0, response_1.sendError)(res, 'First name and last name are required', 400);
            }
            const contactId = await ContactRepository_1.ContactRepository.create(userId, {
                first_name,
                last_name,
                email,
                phone,
                company,
                job_title,
                location,
                website,
                linkedin_url,
                avatar_url,
                relationship_type,
                relationship_strength,
                next_follow_up_at,
                notes,
                tagNames,
            });
            await TagRepository_1.TagRepository.syncContactWarmth(userId, contactId);
            const contact = await ContactRepository_1.ContactRepository.getById(userId, contactId);
            await (0, audit_1.logAudit)(req, 'CONTACT_CREATED', 'contact', contactId);
            return (0, response_1.sendSuccess)(res, contact, 201);
        }
        catch (err) {
            next(err);
        }
    }
    static async update(req, res, next) {
        try {
            const userId = req.user.userId;
            const contactId = parseInt(String(req.params.id), 10);
            if (isNaN(contactId))
                return (0, response_1.sendError)(res, 'Invalid contact ID', 400);
            const existing = await ContactRepository_1.ContactRepository.getById(userId, contactId);
            if (!existing)
                return (0, response_1.sendError)(res, 'Contact not found', 404);
            await ContactRepository_1.ContactRepository.update(userId, contactId, req.body);
            const updated = await ContactRepository_1.ContactRepository.getById(userId, contactId);
            await (0, audit_1.logAudit)(req, 'CONTACT_UPDATED', 'contact', contactId);
            return (0, response_1.sendSuccess)(res, updated);
        }
        catch (err) {
            next(err);
        }
    }
    static async delete(req, res, next) {
        try {
            const userId = req.user.userId;
            const contactId = parseInt(String(req.params.id), 10);
            if (isNaN(contactId))
                return (0, response_1.sendError)(res, 'Invalid contact ID', 400);
            const deleted = await ContactRepository_1.ContactRepository.delete(userId, contactId);
            if (!deleted)
                return (0, response_1.sendError)(res, 'Contact not found or could not be deleted', 404);
            await (0, audit_1.logAudit)(req, 'CONTACT_DELETED', 'contact', contactId);
            return (0, response_1.sendSuccess)(res, { message: 'Contact deleted successfully' });
        }
        catch (err) {
            next(err);
        }
    }
    static async getTags(req, res, next) {
        try {
            const userId = req.user.userId;
            const tags = await TagRepository_1.TagRepository.listByUserId(userId);
            return (0, response_1.sendSuccess)(res, tags);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ContactController = ContactController;
