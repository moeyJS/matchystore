const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireStaff } = require('../middleware/auth');
const prisma = require('../lib/prisma');

const router = express.Router();

// Dashboard statistics
router.get('/dashboard/stats', authenticateToken, requireStaff, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalProducts,
      activeProducts,
      totalOrders,
      totalCustomers,
      totalRevenue,
      monthlyRevenue,
      lastMonthRevenue,
      pendingOrders,
      processingOrders,
      completedOrders,
      recentOrders,
      lowStockProducts,
      guestCustomers
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true }
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: startOfMonth } },
        _sum: { totalAmount: true }
      }),
      prisma.order.aggregate({
        where: { 
          createdAt: { 
            gte: startOfLastMonth,
            lte: endOfLastMonth
          } 
        },
        _sum: { totalAmount: true }
      }),
      prisma.order.count({ where: { status: 'PROCESSING' } }),
      prisma.order.count({ where: { status: 'CONFIRMED' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      }),
      prisma.product.findMany({
        where: {
          isActive: true,
          stock: { lte: 10 }
        },
        select: {
          id: true,
          name: true,
          stock: true,
          price: true
        },
        take: 10
      }),
      prisma.order.findMany({
        where: { userId: null },
        select: { customerPhone: true },
        distinct: ['customerPhone']
      })
    ]);

    // Calculate changes
    const currentRevenue = monthlyRevenue._sum.totalAmount || 0;
    const previousRevenue = lastMonthRevenue._sum.totalAmount || 0;
    const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    res.json({
      totalProducts,
      activeProducts,
      totalOrders,
      totalCustomers: totalCustomers + guestCustomers.length,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      pendingOrders,
      processingOrders,
      completedOrders,
      recentOrders,
      lowStockProducts,
      revenueChange: Math.round(revenueChange * 100) / 100,
      ordersChange: 0 // TODO: Calculate orders change
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Brand management
router.post('/brands', authenticateToken, requireStaff, [
  body('name').notEmpty().trim(),
  body('logo').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, logo } = req.body;

    const brand = await prisma.brand.create({
      data: { name, logo }
    });

    res.status(201).json(brand);
  } catch (error) {
    console.error('Create brand error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/brands', authenticateToken, requireStaff, async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' }
    });

    res.json(brands);
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/brands/:id', authenticateToken, requireStaff, [
  body('name').optional().notEmpty().trim(),
  body('logo').optional().isURL(),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    const brand = await prisma.brand.update({
      where: { id },
      data: updateData
    });

    res.json(brand);
  } catch (error) {
    console.error('Update brand error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/brands/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    await prisma.brand.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });

    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Delete brand error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Category management
router.post('/categories', authenticateToken, requireStaff, [
  body('name').notEmpty().trim(),
  body('description').optional().trim(),
  body('image').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, image } = req.body;

    const category = await prisma.category.create({
      data: { name, description, image }
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/categories', authenticateToken, requireStaff, async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/categories/:id', authenticateToken, requireStaff, [
  body('name').optional().notEmpty().trim(),
  body('description').optional().trim(),
  body('image').optional().isURL(),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: updateData
    });

    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/categories/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    await prisma.category.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


