const express = require('express');
const app = express();

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasDatabaseUrl: !!process.env.DATABASE_URL
  });
});

// Test Prisma connection
app.get('/api/test-db', async (req, res) => {
  try {
    const prisma = require('./lib/prisma');
    await prisma.$connect();
    res.json({ status: 'Database connected successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});

module.exports = app;
