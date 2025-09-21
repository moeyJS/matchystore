const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { authenticateToken, requireAdmin, requireStaff } = require('../middleware/auth');
const prisma = require('../lib/prisma');

const router = express.Router();

// Generate unique order number
const generateOrderNumber = async () => {
  // Get the count of existing orders to generate sequential number
  const orderCount = await prisma.order.count();
  const orderNumber = (orderCount + 1).toString().padStart(4, '0');
  return `MTCH-${orderNumber}`;
};

// Create order
router.post('/', authenticateToken, [
  body('customerName').notEmpty().trim(),
  body('customerPhone').custom((value) => {
    if (!value) {
      throw new Error('Phone number is required');
    }
    const cleanPhone = value.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      throw new Error('Phone number must be between 10 and 15 digits');
    }
    return true;
  }),
  body('shippingAddress').isObject(),
  body('shippingAddress.country').notEmpty().trim(),
  body('shippingAddress.province').notEmpty().trim(),
  body('shippingAddress.street').notEmpty().trim(),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { customerName, customerPhone, shippingAddress, notes } = req.body;

    // Get user's cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce((total, item) => {
      return total + (item.quantity * parseFloat(item.product.price));
    }, 0);

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: await generateOrderNumber(),
        customerName,
        customerPhone,
        shippingAddress,
        notes,
        totalAmount,
        userId: req.user.id
      }
    });

    // Create order items
    const orderItems = await Promise.all(
      cartItems.map(item =>
        prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price
          }
        })
      )
    );

    // Clear user's cart
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id }
    });

    // Emit order created event via WebSocket
    const { io } = require('../index');
    io.to('admin-room').emit('order-created', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName,
      totalAmount
    });

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        ...order,
        orderItems
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's orders
router.get('/my-orders', authenticateToken, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['PROCESSING', 'CONFIRMED', 'EN_ROUTE', 'DELIVERED', 'CANCELLED'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 20,
      status
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      userId: req.user.id,
      ...(status && { status })
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: {
            include: {
              product: {
                include: {
                  brand: true,
                  category: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get orders by phone number (for guest users)
router.get('/by-phone', [
  query('phone').notEmpty().withMessage('Phone number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone } = req.query;
    const cleanPhone = phone.replace(/\D/g, '');

    const orders = await prisma.order.findMany({
      where: {
        customerPhone: cleanPhone
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                brand: {
                  select: { name: true }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      orders,
      count: orders.length
    });

  } catch (error) {
    console.error('Get orders by phone error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single order
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                brand: true,
                category: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all orders (admin/staff only)
router.get('/', authenticateToken, requireStaff, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['PROCESSING', 'CONFIRMED', 'EN_ROUTE', 'DELIVERED', 'CANCELLED']),
  query('search').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 20,
      status,
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { orderNumber: { contains: search, mode: 'insensitive' } },
          { customerName: { contains: search, mode: 'insensitive' } },
          { customerPhone: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: {
            include: {
              product: {
                include: {
                  brand: true,
                  category: true
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update order status (admin/staff only)
router.put('/:id/status', authenticateToken, requireStaff, [
  body('status').isIn(['PROCESSING', 'CONFIRMED', 'EN_ROUTE', 'DELIVERED', 'CANCELLED'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                brand: true,
                category: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    // Emit status update via WebSocket
    const { io } = require('../index');
    if (order.userId) {
      io.to(`user-${order.userId}`).emit('order-status-updated', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status
      });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get order statistics (admin only)
router.get('/stats/overview', authenticateToken, requireStaff, async (req, res) => {
  try {
    const [
      totalOrders,
      totalRevenue,
      ordersByStatus,
      recentOrders
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true }
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      })
    ]);

    res.json({
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {}),
      recentOrders
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Guest checkout (no authentication required)
router.post('/guest', [
  body('customerName').notEmpty().trim(),
  body('customerPhone').custom((value) => {
    if (!value) {
      throw new Error('Phone number is required');
    }
    const cleanPhone = value.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      throw new Error('Phone number must be between 10 and 15 digits');
    }
    return true;
  }),
  body('shippingAddress').isObject(),
  body('shippingAddress.country').notEmpty().trim(),
  body('shippingAddress.province').notEmpty().trim(),
  body('shippingAddress.street').notEmpty().trim(),
  body('notes').optional().trim(),
  body('cartItems').isArray().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { customerName, customerPhone, shippingAddress, notes, cartItems } = req.body;

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return res.status(400).json({ error: `Product with ID ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }

      const itemTotal = parseFloat(product.price) * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: parseFloat(product.price)
      });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: await generateOrderNumber(),
        customerName,
        customerPhone: customerPhone.replace(/\D/g, ''),
        shippingAddress,
        notes: notes || '',
        totalAmount,
        shippingCost: 0,
        status: 'PROCESSING',
        orderItems: {
          create: orderItems
        }
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                brand: {
                  select: { name: true }
                }
              }
            }
          }
        }
      }
    });

    // Update product stock
    for (const item of orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    res.status(201).json({
      message: 'Order created successfully',
      order
    });

  } catch (error) {
    console.error('Guest checkout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel order
router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if order can be cancelled (only PROCESSING orders)
    if (order.status !== 'PROCESSING') {
      return res.status(400).json({ 
        error: 'Order cannot be cancelled. Only processing orders can be cancelled.' 
      });
    }

    // Update order status to CANCELLED
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    // Restore product stock
    for (const item of order.orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity
          }
        }
      });
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
