const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

// Search & filter scan history
router.get('/', authenticate, async (req, res) => {
  try {
    const { q, status, page = 1, limit = 50 } = req.query;
    let scans = await db.findMany('scan_results', {});

    // Filter by search query (domain or issuer)
    if (q && q.trim()) {
      const search = q.trim().toLowerCase();
      scans = scans.filter(s =>
        (s.domain && s.domain.toLowerCase().includes(search)) ||
        (s.url && s.url.toLowerCase().includes(search)) ||
        (s.issuer && s.issuer.toLowerCase().includes(search)) ||
        (s.issuer_org && s.issuer_org.toLowerCase().includes(search))
      );
    }

    // Filter by status
    if (status && status !== 'all') {
      scans = scans.filter(s => s.status === status);
    }

    const total = scans.length;
    const startIndex = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const paginated = scans.slice(startIndex, startIndex + parseInt(limit, 10));

    res.json({
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)) || 1,
      scans: paginated
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export CSV
router.get('/export.csv', authenticate, async (req, res) => {
  try {
    const scans = await db.findMany('scan_results', {});

    const headers = [
      'ID',
      'Target Domain',
      'URL',
      'Status',
      'Grade',
      'TLS Version',
      'Cipher Suite',
      'Issuer Org',
      'Valid From',
      'Valid To',
      'Days Remaining',
      'Serial Number',
      'Scanned At'
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = scans.map(s => [
      escapeCsv(s.id),
      escapeCsv(s.domain),
      escapeCsv(s.url),
      escapeCsv(s.status),
      escapeCsv(s.grade),
      escapeCsv(s.tls_version),
      escapeCsv(s.cipher_suite),
      escapeCsv(s.issuer_org || s.issuer),
      escapeCsv(s.valid_from),
      escapeCsv(s.valid_to),
      escapeCsv(s.days_remaining),
      escapeCsv(s.serial_number),
      escapeCsv(s.scanned_at)
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="securescan_history_${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete single scan entry
router.delete('/:id', authenticate, requireRole(['Admin', 'Analyst']), async (req, res) => {
  try {
    await db.delete('scan_results', { id: req.params.id });
    res.json({ message: 'Scan history record deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear all scan history
router.delete('/', authenticate, requireRole(['Admin']), async (req, res) => {
  try {
    await db.delete('scan_results', {});
    await logAudit(req.user, 'SCAN_HISTORY_CLEARED', 'History', 'ALL', 'Admin cleared all scan history', req);
    res.json({ message: 'All scan history cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
