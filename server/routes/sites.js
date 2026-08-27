const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { db } = require('../db');
const { scanSSL, parseTarget } = require('../services/sslScanner');
const { checkSite, checkAllMonitoredSites } = require('../services/monitorCron');
const { authenticate, requireRole } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

// List monitored sites with stats
router.get('/', authenticate, async (req, res) => {
  try {
    const sites = await db.findMany('monitored_sites', {});

    // Compute stats
    const totalSites = sites.length;
    const expiringSoon = sites.filter(s => s.status !== 'expired' && s.days_remaining > 0 && s.days_remaining <= 30).length;
    const expired = sites.filter(s => s.status === 'expired' || s.days_remaining <= 0).length;
    const healthy = sites.filter(s => s.status === 'valid' && s.days_remaining > 30).length;

    res.json({
      stats: {
        totalSites,
        expiringSoon,
        expired,
        healthy
      },
      sites
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new site to monitor
router.post('/', authenticate, requireRole(['Admin', 'Analyst']), async (req, res) => {
  try {
    const { domain, port = 443, name, check_frequency_minutes = 60, enable_email_alerts = true, enable_inapp_alerts = true } = req.body;
    if (!domain) {
      return res.status(400).json({ error: 'Domain name is required' });
    }

    const { hostname, port: parsedPort } = parseTarget(domain);
    const existing = await db.findOne('monitored_sites', { domain: hostname });
    if (existing) {
      return res.status(409).json({ error: `Domain ${hostname} is already in the monitoring queue` });
    }

    const newSite = {
      id: crypto.randomUUID(),
      user_id: req.user.id,
      domain: hostname,
      port: port || parsedPort || 443,
      name: name || hostname,
      status: 'pending',
      days_remaining: 0,
      issuer: 'Pending initial scan',
      tls_version: 'TLS 1.3',
      last_scan_id: null,
      last_checked_at: null,
      check_frequency_minutes: parseInt(check_frequency_minutes, 10) || 60,
      enable_email_alerts: Boolean(enable_email_alerts),
      enable_inapp_alerts: Boolean(enable_inapp_alerts)
    };

    const inserted = await db.insert('monitored_sites', newSite);
    await logAudit(req.user, 'SITE_ADDED_TO_MONITOR', 'Site', inserted.id, `Added ${hostname} to active monitoring`, req);

    // Trigger initial scan asynchronously
    checkSite(inserted).catch(err => console.error('Initial scan failed:', err));

    res.status(201).json(inserted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Re-scan a single site
router.post('/:id/scan', authenticate, requireRole(['Admin', 'Analyst']), async (req, res) => {
  try {
    const site = await db.findOne('monitored_sites', { id: req.params.id });
    if (!site) {
      return res.status(404).json({ error: 'Monitored site not found' });
    }

    const scanResult = await checkSite(site);
    await logAudit(req.user, 'SITE_RESCAN_TRIGGERED', 'Site', site.id, `Manually re-scanned ${site.domain}`, req);

    const updatedSite = await db.findOne('monitored_sites', { id: site.id });
    res.json({ site: updatedSite, scan: scanResult });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trigger monitoring check on all sites
router.post('/check-all', authenticate, requireRole(['Admin', 'Analyst']), async (req, res) => {
  try {
    const sweepResult = await checkAllMonitoredSites();
    await logAudit(req.user, 'MANUAL_SWEEP_EXECUTED', 'Sites', 'ALL', 'Manually executed monitoring sweep across all domains', req);
    res.json(sweepResult);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete site
router.delete('/:id', authenticate, requireRole(['Admin', 'Analyst']), async (req, res) => {
  try {
    const site = await db.findOne('monitored_sites', { id: req.params.id });
    if (!site) {
      return res.status(404).json({ error: 'Monitored site not found' });
    }

    await db.delete('monitored_sites', { id: req.params.id });
    await logAudit(req.user, 'SITE_REMOVED_FROM_MONITOR', 'Site', req.params.id, `Removed ${site.domain} from monitoring`, req);

    res.json({ message: 'Site removed from monitoring', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
