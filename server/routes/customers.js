const express = require('express');
const { query, validationResult } = require('express-validator');
const { authenticateToken, requireStaff } = require('../middleware/auth');
const prisma = require('../lib/prisma');

const router = express.Router();

// Get all customers (staff only)
router.get('/', authenticateToken, requireStaff, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
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
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      role: 'CUSTOMER',
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    // Get registered customers
    const [registeredCustomers, registeredTotal] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          _count: {
            select: {
              orders: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.user.count({ where })
    ]);

    // Get guest customers from orders (unique phone numbers)
    const guestCustomers = await prisma.order.findMany({
      where: {
        userId: null, // Guest orders
        ...(search && {
          OR: [
            { customerName: { contains: search, mode: 'insensitive' } },
            { customerPhone: { contains: search, mode: 'insensitive' } }
          ]
        })
      },
      select: {
        customerName: true,
        customerPhone: true,
        createdAt: true,
        _count: {
          select: {
            orderItems: true
          }
        }
      },
      distinct: ['customerPhone'],
      orderBy: { createdAt: 'desc' }
    });

    // Combine and format customers
    const allCustomers = [
      ...registeredCustomers.map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        createdAt: customer.createdAt,
        orderCount: customer._count.orders,
        isGuest: false
      })),
      ...guestCustomers.map(order => ({
        id: `guest-${order.customerPhone}`,
        name: order.customerName,
        email: null,
        phone: order.customerPhone,
        createdAt: order.createdAt,
        orderCount: order._count.orderItems,
        isGuest: true
      }))
    ];

    // Sort by creation date
    allCustomers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const customers = allCustomers.slice(skip, skip + parseInt(limit));
    const total = allCustomers.length;

    res.json({
      customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get customer details (staff only)
router.get('/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const customerId = req.params.id;
    
    // Check if it's a guest customer
    if (customerId.startsWith('guest-')) {
      const phoneNumber = customerId.replace('guest-', '');
      
      // Get guest customer details from orders
      const guestOrders = await prisma.order.findMany({
        where: {
          userId: null,
          customerPhone: phoneNumber
        },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  images: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (guestOrders.length === 0) {
        return res.status(404).json({ error: 'Guest customer not found' });
      }

      // Format guest customer data
      const guestCustomer = {
        id: customerId,
        name: guestOrders[0].customerName,
        email: null,
        phone: guestOrders[0].customerPhone,
        createdAt: guestOrders[0].createdAt,
        isGuest: true,
        orders: guestOrders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalAmount: order.totalAmount,
          shippingCost: order.shippingCost,
          shippingAddress: order.shippingAddress,
          notes: order.notes,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          orderItems: order.orderItems
        }))
      };

      return res.json(guestCustomer);
    }

    // Handle registered customer
    const customer = await prisma.user.findFirst({
      where: {
        id: customerId,
        role: 'CUSTOMER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        isGuest: false,
        orders: {
          include: {
            orderItems: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    images: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get customer statistics (staff only)
router.get('/stats/overview', authenticateToken, requireStaff, async (req, res) => {
  try {
    const [
      registeredCustomers,
      newRegisteredCustomersThisMonth,
      guestCustomers,
      newGuestCustomersThisMonth,
      topRegisteredCustomers
    ] = await Promise.all([
      prisma.user.count({
        where: { role: 'CUSTOMER' }
      }),
      prisma.user.count({
        where: {
          role: 'CUSTOMER',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      prisma.order.findMany({
        where: { userId: null },
        select: { customerPhone: true },
        distinct: ['customerPhone']
      }),
      prisma.order.findMany({
        where: {
          userId: null,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        select: { customerPhone: true },
        distinct: ['customerPhone']
      }),
      prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        select: {
          id: true,
          name: true,
          email: true,
          _count: {
            select: { orders: true }
          }
        },
        orderBy: {
          orders: {
            _count: 'desc'
          }
        },
        take: 10
      })
    ]);

    const totalCustomers = registeredCustomers + guestCustomers.length;
    const newCustomersThisMonth = newRegisteredCustomersThisMonth + newGuestCustomersThisMonth.length;

    res.json({
      totalCustomers,
      newCustomersThisMonth,
      topCustomers: topRegisteredCustomers
    });
  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

