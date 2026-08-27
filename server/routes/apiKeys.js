const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { db } = require('../db');
const { authenticate } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

// List user API keys
router.get('/', authenticate, async (req, res) => {
  try {
    const keys = await db.findMany('api_keys', { user_id: req.user.id });
    res.json(keys);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate new API key
router.post('/', authenticate, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Token name is required' });
    }

    const rawSecret = crypto.randomBytes(24).toString('hex');
    const fullKey = `sec_live_${rawSecret}`;
    const prefix = fullKey.substring(0, 12) + '...';
    const keyHash = crypto.createHash('sha256').update(fullKey).digest('hex');

    const record = {
      id: crypto.randomUUID(),
      user_id: req.user.id,
      name,
      key_prefix: prefix,
      key_hash: keyHash,
      last_used_at: null,
      created_at: new Date().toISOString()
    };

    await db.insert('api_keys', record);
    await logAudit(req.user, 'API_KEY_GENERATED', 'APIKey', record.id, `Created API key: ${name}`, req);

    res.status(201).json({
      ...record,
      api_key: fullKey // Shown only once upon creation
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Revoke API key
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const key = await db.findOne('api_keys', { id: req.params.id, user_id: req.user.id });
    if (!key) {
      return res.status(404).json({ error: 'API key not found' });
    }

    await db.delete('api_keys', { id: req.params.id });
    await logAudit(req.user, 'API_KEY_REVOKED', 'APIKey', req.params.id, `Revoked API key: ${key.name}`, req);

    res.json({ message: 'API key revoked successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
