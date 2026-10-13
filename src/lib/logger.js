import { connectDB } from './mongodb.js';
import AuditLog from '../models/AuditLog.js';

/**
 * Audit and application logger
 */
export async function logAuditEvent({
  userId,
  userEmail,
  action,
  entity,
  entityId,
  details = {},
  ipAddress = 'unknown',
}) {
  try {
    await connectDB();
    await AuditLog.create({
      user: userId,
      userEmail,
      action,
      entity,
      entityId: entityId ? String(entityId) : null,
      details,
      ipAddress,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('[AUDIT_LOG_ERROR]', error.message);
  }
}

export function logInfo(message, context = {}) {
  console.log(`[INFO] ${new Date().toISOString()} - ${message}`, JSON.stringify(context));
}

export function logError(message, error, context = {}) {
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error?.message || error, JSON.stringify(context));
}
