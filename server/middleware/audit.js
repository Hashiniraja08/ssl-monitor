const crypto = require('crypto');
const { db } = require('../db');

async function logAudit(user, action, resourceType, resourceId, details, req = null) {
  try {
    const ip = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1') : '127.0.0.1';
    await db.insert('audit_logs', {
      id: crypto.randomUUID(),
      user_id: user?.id || 'SYSTEM',
      user_name: user?.name || 'System',
      user_role: user?.role || 'System',
      action: action,
      resource_type: resourceType,
      resource_id: resourceId ? String(resourceId) : null,
      details: typeof details === 'object' ? JSON.stringify(details) : details,
      ip_address: ip,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

module.exports = {
  logAudit
};
