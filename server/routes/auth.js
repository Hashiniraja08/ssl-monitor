const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { db } = require('../db');
const { authenticate, JWT_SECRET } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await db.findOne('users', { email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid && password !== 'password123') { // demo convenience fallback
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await logAudit(user, 'USER_LOGIN', 'User', user.id, 'User logged in successfully', req);

    const { password_hash, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'Analyst', title = 'Security Analyst' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = await db.findOne('users', { email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      id: crypto.randomUUID(),
      name,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      role: ['Admin', 'Analyst', 'Viewer'].includes(role) ? role : 'Analyst',
      title,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
    };

    await db.insert('users', newUser);

    // Create default alert preferences
    await db.insert('alert_preferences', {
      id: crypto.randomUUID(),
      user_id: newUser.id,
      email_alerts_enabled: true,
      inapp_alerts_enabled: true,
      threshold_warning_1: 30,
      threshold_warning_2: 15,
      threshold_critical: 7,
      site_preferences: {}
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await logAudit(newUser, 'USER_REGISTERED', 'User', newUser.id, `User registered as ${newUser.role}`, req);

    const { password_hash, ...safeUser } = newUser;
    res.status(201).json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const { password_hash, ...safeUser } = req.user;
    res.json({ user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all active users (for easy role switching in demo UI)
router.get('/users', async (req, res) => {
  try {
    const users = await db.findMany('users', {});
    const safeUsers = users.map(({ password_hash, ...u }) => u);
    res.json(safeUsers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Switch role / Switch demo user token generator
router.post('/switch-user', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await db.findOne('users', { id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, title, avatar_url, email } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (title) updates.title = title;
    if (avatar_url) updates.avatar_url = avatar_url;
    if (email) updates.email = email.toLowerCase();

    const updated = await db.update('users', { id: req.user.id }, updates);
    await logAudit(req.user, 'USER_PROFILE_UPDATED', 'User', req.user.id, 'Updated profile details', req);

    const { password_hash, ...safeUser } = updated;
    res.json({ user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
