const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { getAlertPreferences } = require('../services/alertService');
const { authenticate } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

// Get alert preferences
router.get('/preferences', authenticate, async (req, res) => {
  try {
    const prefs = await getAlertPreferences(req.user.id);
    const sites = await db.findMany('monitored_sites', {});
    res.json({ preferences: prefs, sites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update alert preferences
router.put('/preferences', authenticate, async (req, res) => {
  try {
    const {
      email_alerts_enabled,
      inapp_alerts_enabled,
      threshold_warning_1,
      threshold_warning_2,
      threshold_critical,
      site_preferences
    } = req.body;

    const updates = {};
    if (email_alerts_enabled !== undefined) updates.email_alerts_enabled = Boolean(email_alerts_enabled);
    if (inapp_alerts_enabled !== undefined) updates.inapp_alerts_enabled = Boolean(inapp_alerts_enabled);
    if (threshold_warning_1 !== undefined) updates.threshold_warning_1 = parseInt(threshold_warning_1, 10);
    if (threshold_warning_2 !== undefined) updates.threshold_warning_2 = parseInt(threshold_warning_2, 10);
    if (threshold_critical !== undefined) updates.threshold_critical = parseInt(threshold_critical, 10);
    if (site_preferences !== undefined) updates.site_preferences = site_preferences;

    // Ensure record exists
    await getAlertPreferences(req.user.id);

    const updated = await db.update('alert_preferences', { user_id: req.user.id }, updates);
    await logAudit(req.user, 'ALERT_PREFERENCES_UPDATED', 'Preferences', req.user.id, 'Updated alert thresholds and delivery channels', req);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user notifications
router.get('/notifications', authenticate, async (req, res) => {
  try {
    const notifications = await db.findMany('notifications', { user_id: req.user.id });
    const unreadCount = notifications.filter(n => !n.is_read).length;
    res.json({
      unread_count: unreadCount,
      notifications
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all notifications as read
router.put('/notifications/read-all', authenticate, async (req, res) => {
  try {
    const notifications = await db.findMany('notifications', { user_id: req.user.id });
    for (const notif of notifications) {
      if (!notif.is_read) {
        await db.update('notifications', { id: notif.id }, { is_read: true });
      }
    }
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark single notification as read
router.put('/notifications/:id/read', authenticate, async (req, res) => {
  try {
    const updated = await db.update('notifications', { id: req.params.id }, { is_read: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete notification
router.delete('/notifications/:id', authenticate, async (req, res) => {
  try {
    await db.delete('notifications', { id: req.params.id });
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
