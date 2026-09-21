"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactRepository = void 0;
const db_1 = require("../config/db");
class ContactRepository {
    static async list(userId, filters = {}) {
        const page = Math.max(1, Number(filters.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
        const offset = (page - 1) * limit;
        const whereClauses = ['c.user_id = ?'];
        const params = [userId];
        if (filters.search) {
            whereClauses.push('(c.first_name LIKE ? OR c.last_name LIKE ? OR c.company LIKE ? OR c.job_title LIKE ? OR c.email LIKE ?)');
            const s = `%${filters.search}%`;
            params.push(s, s, s, s, s);
        }
        if (filters.relationship_type && filters.relationship_type !== 'all') {
            whereClauses.push('c.relationship_type = ?');
            params.push(filters.relationship_type);
        }
        if (filters.company) {
            whereClauses.push('c.company LIKE ?');
            params.push(`%${filters.company}%`);
        }
        if (filters.follow_up_due) {
            whereClauses.push('c.next_follow_up_at IS NOT NULL AND c.next_follow_up_at <= NOW()');
        }
        if (filters.tag) {
            whereClauses.push('EXISTS (SELECT 1 FROM contact_tags ct JOIN tags t ON ct.tag_id = t.tag_id WHERE ct.contact_id = c.contact_id AND t.name = ?)');
            params.push(filters.tag);
        }
        const whereSql = whereClauses.join(' AND ');
        // Allowed sort columns
        const allowedSorts = ['last_interaction_at', 'relationship_strength', 'first_name', 'next_follow_up_at', 'created_at'];
        const sortBy = allowedSorts.includes(filters.sort_by || '') ? `c.${filters.sort_by}` : 'c.updated_at';
        const sortOrder = filters.sort_order === 'ASC' ? 'ASC' : 'DESC';
        // Count query
        const countRows = await (0, db_1.query)(`SELECT COUNT(*) as total FROM contacts c WHERE ${whereSql}`, params);
        const total = countRows[0]?.total || 0;
        // Items query with GROUP_CONCAT of tags
        const items = await (0, db_1.query)(`SELECT 
        c.*,
        GROUP_CONCAT(DISTINCT CONCAT(t.tag_id, ':::', t.name, ':::', t.color) SEPARATOR '|||') as tags_str
       FROM contacts c
       LEFT JOIN contact_tags ct ON c.contact_id = ct.contact_id
       LEFT JOIN tags t ON ct.tag_id = t.tag_id
       WHERE ${whereSql}
       GROUP BY c.contact_id
       ORDER BY ${sortBy} ${sortOrder}
       LIMIT ${limit} OFFSET ${offset}`, params);
        const formattedItems = items.map((item) => ({
            ...item,
            tags: item.tags_str
                ? item.tags_str.split('|||').map((str) => {
                    const [tag_id, name, color] = str.split(':::');
                    return { tag_id: parseInt(tag_id, 10), name, color };
                })
                : [],
        }));
        return {
            items: formattedItems,
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit),
            },
        };
    }
    static async getById(userId, contactId) {
        const rows = await (0, db_1.query)(`SELECT 
        c.*,
        GROUP_CONCAT(DISTINCT CONCAT(t.tag_id, ':::', t.name, ':::', t.color) SEPARATOR '|||') as tags_str
       FROM contacts c
       LEFT JOIN contact_tags ct ON c.contact_id = ct.contact_id
       LEFT JOIN tags t ON ct.tag_id = t.tag_id
       WHERE c.user_id = ? AND c.contact_id = ?
       GROUP BY c.contact_id
       LIMIT 1`, [userId, contactId]);
        if (!rows[0])
            return null;
        const item = rows[0];
        return {
            ...item,
            tags: item.tags_str
                ? item.tags_str.split('|||').map((str) => {
                    const [tag_id, name, color] = str.split(':::');
                    return { tag_id: parseInt(tag_id, 10), name, color };
                })
                : [],
        };
    }
    static async create(userId, data) {
        return (0, db_1.withTransaction)(async (conn) => {
            const [res] = await conn.execute(`INSERT INTO contacts (
          user_id, first_name, last_name, email, phone, company, job_title, location, website, linkedin_url, avatar_url, relationship_type, relationship_strength, next_follow_up_at, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                userId,
                data.first_name || '',
                data.last_name || '',
                data.email || null,
                data.phone || null,
                data.company || null,
                data.job_title || null,
                data.location || null,
                data.website || null,
                data.linkedin_url || null,
                data.avatar_url || null,
                data.relationship_type || 'other',
                data.relationship_strength ?? 50,
                data.next_follow_up_at || null,
                data.notes || null,
            ]);
            const contactId = res.insertId;
            if (data.tagNames && Array.isArray(data.tagNames)) {
                for (const tagName of data.tagNames) {
                    if (!tagName.trim())
                        continue;
                    // Find or create tag
                    const [tRows] = await conn.execute(`SELECT tag_id FROM tags WHERE user_id = ? AND name = ? LIMIT 1`, [userId, tagName.trim()]);
                    let tagId = tRows[0]?.tag_id;
                    if (!tagId) {
                        const [tIns] = await conn.execute(`INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?)`, [userId, tagName.trim(), '#2563EB']);
                        tagId = tIns.insertId;
                    }
                    await conn.execute(`INSERT IGNORE INTO contact_tags (contact_id, tag_id) VALUES (?, ?)`, [contactId, tagId]);
                }
            }
            return contactId;
        });
    }
    static async update(userId, contactId, data) {
        return (0, db_1.withTransaction)(async (conn) => {
            await conn.execute(`UPDATE contacts SET
          first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          email = COALESCE(?, email),
          phone = COALESCE(?, phone),
          company = COALESCE(?, company),
          job_title = COALESCE(?, job_title),
          location = COALESCE(?, location),
          website = COALESCE(?, website),
          linkedin_url = COALESCE(?, linkedin_url),
          avatar_url = COALESCE(?, avatar_url),
          relationship_type = COALESCE(?, relationship_type),
          relationship_strength = COALESCE(?, relationship_strength),
          next_follow_up_at = COALESCE(?, next_follow_up_at),
          notes = COALESCE(?, notes)
        WHERE user_id = ? AND contact_id = ?`, [
                data.first_name ?? null,
                data.last_name ?? null,
                data.email ?? null,
                data.phone ?? null,
                data.company ?? null,
                data.job_title ?? null,
                data.location ?? null,
                data.website ?? null,
                data.linkedin_url ?? null,
                data.avatar_url ?? null,
                data.relationship_type ?? null,
                data.relationship_strength ?? null,
                data.next_follow_up_at ?? null,
                data.notes ?? null,
                userId,
                contactId,
            ]);
            if (data.tagNames && Array.isArray(data.tagNames)) {
                // Clear existing tags and re-link
                await conn.execute(`DELETE FROM contact_tags WHERE contact_id = ?`, [contactId]);
                for (const tagName of data.tagNames) {
                    if (!tagName.trim())
                        continue;
                    const [tRows] = await conn.execute(`SELECT tag_id FROM tags WHERE user_id = ? AND name = ? LIMIT 1`, [userId, tagName.trim()]);
                    let tagId = tRows[0]?.tag_id;
                    if (!tagId) {
                        const [tIns] = await conn.execute(`INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?)`, [userId, tagName.trim(), '#2563EB']);
                        tagId = tIns.insertId;
                    }
                    await conn.execute(`INSERT IGNORE INTO contact_tags (contact_id, tag_id) VALUES (?, ?)`, [contactId, tagId]);
                }
            }
        });
    }
    static async delete(userId, contactId) {
        const result = await (0, db_1.query)(`DELETE FROM contacts WHERE user_id = ? AND contact_id = ?`, [userId, contactId]);
        return result.affectedRows > 0;
    }
    static async updateLastInteraction(userId, contactId, interactionDate) {
        await (0, db_1.query)(`UPDATE contacts SET last_interaction_at = ?, relationship_strength = LEAST(100, relationship_strength + 5)
       WHERE user_id = ? AND contact_id = ?`, [interactionDate, userId, contactId]);
    }
}
exports.ContactRepository = ContactRepository;
