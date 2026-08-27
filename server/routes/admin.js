const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

// List team members
router.get('/members', authenticate, async (req, res) => {
  try {
    const users = await db.findMany('users', {});
    const safeUsers = users.map(({ password_hash, ...u }) => u);
    res.json(safeUsers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Invite / Add team member (Admin only)
router.post('/members', authenticate, requireRole(['Admin']), async (req, res) => {
  try {
    const { name, email, role = 'Analyst', title = 'Security Analyst', password = 'password123' } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const existing = await db.findOne('users', { email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'A team member with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newMember = {
      id: crypto.randomUUID(),
      name,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      role: ['Admin', 'Analyst', 'Viewer'].includes(role) ? role : 'Analyst',
      title,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
    };

    await db.insert('users', newMember);
    await logAudit(req.user, 'TEAM_MEMBER_INVITED', 'User', newMember.id, `Invited ${name} (${email}) as ${newMember.role}`, req);

    const { password_hash, ...safeMember } = newMember;
    res.status(201).json(safeMember);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update member role (Admin only)
router.put('/members/:id/role', authenticate, requireRole(['Admin']), async (req, res) => {
  try {
    const { role } = req.body;
    if (!['Admin', 'Analyst', 'Viewer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be Admin, Analyst, or Viewer.' });
    }

    const targetUser = await db.findOne('users', { id: req.params.id });
    if (!targetUser) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    const updated = await db.update('users', { id: req.params.id }, { role });
    await logAudit(req.user, 'ROLE_UPDATED', 'User', req.params.id, `Changed role of ${targetUser.name} to ${role}`, req);

    const { password_hash, ...safeMember } = updated;
    res.json(safeMember);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove team member (Admin only)
router.delete('/members/:id', authenticate, requireRole(['Admin']), async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot remove your own admin account' });
    }

    const targetUser = await db.findOne('users', { id: req.params.id });
    if (!targetUser) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    await db.delete('users', { id: req.params.id });
    await logAudit(req.user, 'TEAM_MEMBER_REMOVED', 'User', req.params.id, `Removed ${targetUser.name} (${targetUser.email})`, req);

    res.json({ message: 'Team member removed', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get audit logs (Admin only)
router.get('/audit-logs', authenticate, requireRole(['Admin']), async (req, res) => {
  try {
    const logs = await db.findMany('audit_logs', {});
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
