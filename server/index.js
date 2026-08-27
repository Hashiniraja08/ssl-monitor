require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./db');
const seed = require('./db/seed');
const { startMonitoringCron } = require('./services/monitorCron');

const authRoutes = require('./routes/auth');
const scanRoutes = require('./routes/scan');
const sitesRoutes = require('./routes/sites');
const historyRoutes = require('./routes/history');
const alertsRoutes = require('./routes/alerts');
const adminRoutes = require('./routes/admin');
const apiKeysRoutes = require('./routes/apiKeys');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/sites', sitesRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/apikeys', apiKeysRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SecureScan AI Core Engine',
    version: '2.4.0',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend in production build if present
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) next();
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

async function startServer() {
  try {
    await initDB();
    await seed();
    startMonitoringCron(process.env.CRON_SCHEDULE || '*/15 * * * *');

    app.listen(PORT, () => {
      console.log(`🚀 SecureScan AI Engine running on port ${PORT}`);
      console.log(`🌐 API Endpoint: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
