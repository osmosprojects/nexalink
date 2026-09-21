import { Request } from 'express';
import { query } from '../config/db';

export async function logAudit(
  req: Request,
  action: string,
  entityType: string,
  entityId: number | null = null,
  metadata: any = null
) {
  try {
    const userId = req.user?.userId || null;
    const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        action,
        entityType,
        entityId,
        metadata ? JSON.stringify(metadata) : null,
        ipAddress,
        userAgent.substring(0, 255),
      ]
    );
  } catch (err) {
    console.error('Audit log failed:', err);
  }
}
