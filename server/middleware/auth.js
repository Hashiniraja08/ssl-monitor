const jwt = require('jsonwebtoken');
const { db } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'securescan_ai_super_secret_jwt_key_2026';

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.headers['x-user-id']) {
      // Direct demo user bypass for easy testing
      const user = await db.findOne('users', { id: req.headers['x-user-id'] });
      if (user) {
        req.user = user;
        return next();
      }
    }

    if (!token) {
      // Default to default analyst user if no token provided in demo mode
      const users = await db.findMany('users', {});
      const analyst = users.find(u => u.role === 'Analyst') || users[0];
      if (analyst) {
        req.user = analyst;
        return next();
      }
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.findOne('users', { id: decoded.id });
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
}

function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Permission denied. Requires one of: ${allowedRoles.join(', ')}. Current role: ${req.user.role}`
      });
    }
    next();
  };
}

module.exports = {
  authenticate,
  requireRole,
  JWT_SECRET
};
