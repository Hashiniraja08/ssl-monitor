const { db } = require('../db');
const crypto = require('crypto');

async function getAlertPreferences(userId) {
  let prefs = await db.findOne('alert_preferences', { user_id: userId });
  if (!prefs) {
    prefs = await db.insert('alert_preferences', {
      id: crypto.randomUUID(),
      user_id: userId,
      email_alerts_enabled: true,
      inapp_alerts_enabled: true,
      threshold_warning_1: 30,
      threshold_warning_2: 15,
      threshold_critical: 7,
      site_preferences: {}
    });
  }
  return prefs;
}

async function evaluateAndTriggerAlerts(scanResult, userId = null) {
  try {
    // If no userId, retrieve the owner of the monitored site
    let targetUserId = userId;
    if (!targetUserId && scanResult.site_id) {
      const site = await db.findOne('monitored_sites', { id: scanResult.site_id });
      if (site) targetUserId = site.user_id;
    }

    // Default to admin or first user if still null
    if (!targetUserId) {
      const users = await db.findMany('users', {});
      const admin = users.find(u => u.role === 'Admin') || users[0];
      if (admin) targetUserId = admin.id;
    }

    if (!targetUserId) return;

    const prefs = await getAlertPreferences(targetUserId);
    const domain = scanResult.domain;
    const days = scanResult.days_remaining;

    let alertType = null;
    let title = '';
    let message = '';

    if (scanResult.status === 'error') {
      alertType = 'critical';
      title = `Scan Failure: ${domain}`;
      message = `SSL handshake or connection to ${domain} failed: ${scanResult.error_message || scanResult.error_code}`;
    } else if (scanResult.status === 'expired' || days < 0) {
      alertType = 'critical';
      title = `SSL Certificate Expired: ${domain}`;
      message = `The certificate for ${domain} expired on ${new Date(scanResult.valid_to).toLocaleDateString()}. Immediate action required!`;
    } else if (days <= prefs.threshold_critical) {
      alertType = 'critical';
      title = `Critical Expiry Warning: ${domain}`;
      message = `The certificate for ${domain} expires in ${days} days (${new Date(scanResult.valid_to).toLocaleDateString()}).`;
    } else if (days <= prefs.threshold_warning_2) {
      alertType = 'warning';
      title = `Expiry Warning: ${domain}`;
      message = `The certificate for ${domain} expires in ${days} days. Plan renewal soon.`;
    } else if (days <= prefs.threshold_warning_1) {
      alertType = 'warning';
      title = `Upcoming Expiry Notice: ${domain}`;
      message = `Certificate for ${domain} has ${days} days remaining before expiration.`;
    }

    if (alertType && prefs.inapp_alerts_enabled) {
      // Check if recent duplicate alert was created in the last 12 hours
      const existing = await db.findMany('notifications', { user_id: targetUserId, domain: domain });
      const twelveHoursAgo = Date.now() - 12 * 60 * 60 * 1000;
      const recentDup = existing.find(n => n.type === alertType && new Date(n.created_at).getTime() > twelveHoursAgo);

      if (!recentDup) {
        await db.insert('notifications', {
          id: crypto.randomUUID(),
          user_id: targetUserId,
          type: alertType,
          title: title,
          message: message,
          domain: domain,
          link: `/results?id=${scanResult.id}`,
          is_read: false
        });
      }
    }
  } catch (err) {
    console.error('Error evaluating alerts:', err);
  }
}

module.exports = {
  getAlertPreferences,
  evaluateAndTriggerAlerts
};
