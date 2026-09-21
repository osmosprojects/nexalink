"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAudit = logAudit;
const db_1 = require("../config/db");
async function logAudit(req, action, entityType, entityId = null, metadata = null) {
    try {
        const userId = req.user?.userId || null;
        const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
        const userAgent = req.headers['user-agent'] || 'Unknown';
        await (0, db_1.query)(`INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            userId,
            action,
            entityType,
            entityId,
            metadata ? JSON.stringify(metadata) : null,
            ipAddress,
            userAgent.substring(0, 255),
        ]);
    }
    catch (err) {
        console.error('Audit log failed:', err);
    }
}
