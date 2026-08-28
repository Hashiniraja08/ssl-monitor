const { app, initDB } = require('../server');

let isInitialized = false;

module.exports = async (req, res) => {
  if (!isInitialized) {
    try {
      await initDB();
      isInitialized = true;
    } catch (err) {
      console.error('Vercel initialization error:', err);
    }
  }
  return app(req, res);
};
