const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require("../lib/prisma");
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();


// Get POS Configuration
router.get('/config', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    let config = await prisma.pOSConfig.findFirst({
      where: { isActive: true }
    });

    if (!config) {
      // Create default config if none exists
      config = await prisma.pOSConfig.create({
        data: {
          storeName: 'MatchyStore',
          currency: 'USD',
          taxRate: 0.0
        }
      });
    }

    res.json(config);
  } catch (error) {
    console.error('Get POS config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update POS Configuration
router.put('/config', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), [
  body('storeName').notEmpty().withMessage('Store name is required'),
  body('currency').notEmpty().withMessage('Currency is required'),
  body('taxRate').isFloat({ min: 0, max: 1 }).withMessage('Tax rate must be between 0 and 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { storeName, storeAddress, storePhone, storeEmail, currency, taxRate, receiptHeader, receiptFooter } = req.body;

    let config = await prisma.pOSConfig.findFirst({
      where: { isActive: true }
    });

    if (config) {
      config = await prisma.pOSConfig.update({
        where: { id: config.id },
        data: {
          storeName,
          storeAddress,
          storePhone,
          storeEmail,
          currency,
          taxRate,
          receiptHeader,
          receiptFooter
        }
      });
    } else {
      config = await prisma.pOSConfig.create({
        data: {
          storeName,
          storeAddress,
          storePhone,
          storeEmail,
          currency,
          taxRate,
          receiptHeader,
          receiptFooter
        }
      });
    }

    res.json(config);
  } catch (error) {
    console.error('Update POS config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start POS Session
router.post('/session/start', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'WAREHOUSE']), [
  body('startingCash').isFloat({ min: 0 }).withMessage('Starting cash must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { startingCash } = req.body;
    const cashierId = req.user.id;

    // Check if there's an active session
    const activeSession = await prisma.pOSSession.findFirst({
      where: {
        cashierId,
        isActive: true
      }
    });

    if (activeSession) {
      return res.status(400).json({ error: 'You already have an active POS session' });
    }

    const session = await prisma.pOSSession.create({
      data: {
        cashierId,
        startingCash: parseFloat(startingCash) || 0
      },
      include: {
        cashier: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json(session);
  } catch (error) {
    console.error('Start POS session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// End POS Session
router.post('/session/:sessionId/end', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'WAREHOUSE']), [
  body('endingCash').isFloat({ min: 0 }).withMessage('Ending cash must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sessionId } = req.params;
    const { endingCash } = req.body;

    const session = await prisma.pOSSession.findFirst({
      where: {
        id: sessionId,
        cashierId: req.user.id,
        isActive: true
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Active session not found' });
    }

    const updatedSession = await prisma.pOSSession.update({
      where: { id: sessionId },
      data: {
        endTime: new Date(),
        endingCash: parseFloat(endingCash),
        isActive: false
      },
      include: {
        cashier: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json(updatedSession);
  } catch (error) {
    console.error('End POS session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Active POS Session
router.get('/session/active', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'WAREHOUSE']), async (req, res) => {
  try {
    const session = await prisma.pOSSession.findFirst({
      where: {
        cashierId: req.user.id,
        isActive: true
      },
      include: {
        cashier: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json(session);
  } catch (error) {
    console.error('Get active POS session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get POS Sessions
router.get('/sessions', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { page = 1, limit = 20, cashierId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (cashierId) {
      where.cashierId = cashierId;
    }

    const [sessions, total] = await Promise.all([
      prisma.pOSSession.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          cashier: {
            select: { id: true, name: true, email: true }
          }
        }
      }),
      prisma.pOSSession.count({ where })
    ]);

    res.json({
      sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get POS sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get POS Dashboard Stats
router.get('/dashboard/stats', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalSessions,
      activeSessions,
      todaySessions,
      totalSales,
      todaySales
    ] = await Promise.all([
      prisma.pOSSession.count(),
      prisma.pOSSession.count({ where: { isActive: true } }),
      prisma.pOSSession.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      prisma.pOSSession.aggregate({
        _sum: { totalSales: true }
      }),
      prisma.pOSSession.aggregate({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        },
        _sum: { totalSales: true }
      })
    ]);

    res.json({
      totalSessions,
      activeSessions,
      todaySessions,
      totalSales: totalSales._sum.totalSales || 0,
      todaySales: todaySales._sum.totalSales || 0
    });
  } catch (error) {
    console.error('Get POS dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
