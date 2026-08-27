const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { db } = require('../db');
const { scanSSL } = require('../services/sslScanner');
const { evaluateAndTriggerAlerts } = require('../services/alertService');
const { authenticate } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

// Trigger live scan
router.post('/', authenticate, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Target URL or domain is required' });
    }

    const cleanInput = url.trim();
    const scanData = await scanSSL(cleanInput);

    const scanId = crypto.randomUUID();
    const scanRecord = {
      id: scanId,
      user_id: req.user ? req.user.id : null,
      site_id: null,
      url: scanData.url,
      domain: scanData.domain,
      port: scanData.port,
      ip_addresses: scanData.ip_addresses || [],
      status: scanData.status,
      grade: scanData.grade || 'A',
      tls_version: scanData.tls_version || null,
      cipher_suite: scanData.cipher_suite || null,
      key_type: scanData.key_type || null,
      key_size: scanData.key_size || null,
      common_name: scanData.common_name || null,
      sans: scanData.sans || [],
      issuer: scanData.issuer || null,
      issuer_org: scanData.issuer_org || null,
      serial_number: scanData.serial_number || null,
      signature_algorithm: scanData.signature_algorithm || null,
      valid_from: scanData.valid_from || null,
      valid_to: scanData.valid_to || null,
      days_remaining: scanData.days_remaining !== undefined ? scanData.days_remaining : null,
      thumbprint_sha1: scanData.thumbprint_sha1 || null,
      thumbprint_sha256: scanData.thumbprint_sha256 || null,
      certificate_chain: scanData.certificate_chain || [],
      error_code: scanData.error_code || null,
      error_message: scanData.error_message || null,
      scanned_at: new Date().toISOString()
    };

    await db.insert('scan_results', scanRecord);

    // If this domain matches an existing monitored site, update the site
    const matchedSite = await db.findOne('monitored_sites', { domain: scanData.domain });
    if (matchedSite) {
      await db.update(
        'monitored_sites',
        { id: matchedSite.id },
        {
          status: scanData.status,
          days_remaining: scanData.days_remaining || 0,
          issuer: scanData.issuer_org || scanData.issuer || matchedSite.issuer,
          tls_version: scanData.tls_version || matchedSite.tls_version,
          last_scan_id: scanId,
          last_checked_at: new Date().toISOString()
        }
      );
    }

    // Evaluate alerts
    await evaluateAndTriggerAlerts(scanRecord, req.user ? req.user.id : null);

    if (req.user) {
      await logAudit(req.user, 'SSL_SCAN_EXECUTED', 'Domain', scanData.domain, `Scanned ${scanData.domain} - Status: ${scanData.status}`, req);
    }

    res.json(scanRecord);
  } catch (err) {
    console.error('Scan error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get scan by ID
router.get('/:id', async (req, res) => {
  try {
    const scan = await db.findOne('scan_results', { id: req.params.id });
    if (!scan) {
      return res.status(404).json({ error: 'Scan result not found' });
    }
    res.json(scan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get recent scans
router.get('/list/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '10', 10);
    const scans = await db.findMany('scan_results', {});
    res.json(scans.slice(0, limit));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
