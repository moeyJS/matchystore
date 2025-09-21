const express = require('express');
const { body, validationResult, query } = require('express-validator');
const prisma = require("../lib/prisma");
const { authenticateToken, requireStaff } = require('../middleware/auth');

const router = express.Router();


// Create support ticket (authenticated users)
router.post('/tickets', authenticateToken, [
  body('subject').notEmpty().trim(),
  body('message').notEmpty().trim(),
  body('orderId').optional().isString(),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subject, message, orderId, priority = 'MEDIUM' } = req.body;

    const ticket = await prisma.supportTicket.create({
      data: {
        subject,
        message,
        priority,
        userId: req.user.id,
        orderId: orderId || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true
          }
        }
      }
    });

    // Emit new ticket notification to admin room
    const { io } = require('../index');
    io.to('admin-room').emit('new-support-ticket', ticket);

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Create support ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create support ticket (guest users)
router.post('/tickets/guest', [
  body('subject').notEmpty().trim(),
  body('message').notEmpty().trim(),
  body('orderId').optional().isString(),
  body('customerPhone').notEmpty().trim(),
  body('customerName').notEmpty().trim(),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subject, message, orderId, customerPhone, customerName, priority = 'MEDIUM' } = req.body;

    const ticket = await prisma.supportTicket.create({
      data: {
        subject,
        message,
        priority,
        userId: null, // Guest user
        orderId: orderId || null,
        customerPhone: customerPhone,
        customerName: customerName
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true
          }
        }
      }
    });

    // Emit new ticket notification to admin room
    const { io } = require('../index');
    io.to('admin-room').emit('new-support-ticket', ticket);

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Create guest support ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's support tickets
router.get('/tickets/my-tickets', authenticateToken, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['OPEN', 'IN_PROGRESS', 'CLOSED'])
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

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true
            }
          },
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.supportTicket.count({ where })
    ]);

    res.json({
      tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get user tickets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all support tickets (staff only)
router.get('/tickets', authenticateToken, requireStaff, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['OPEN', 'IN_PROGRESS', 'CLOSED']),
  query('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
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
      priority,
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(status && { status }),
      ...(priority && { priority }),
      ...(search && {
        OR: [
          { subject: { contains: search, mode: 'insensitive' } },
          { message: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true
            }
          },
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.supportTicket.count({ where })
    ]);

    res.json({
      tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single ticket
router.get('/tickets/:id', authenticateToken, async (req, res) => {
  try {
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: req.params.id,
        ...(req.user.role === 'CUSTOMER' ? { userId: req.user.id } : {})
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true
          }
        },
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update ticket status (staff only)
router.put('/tickets/:id/status', authenticateToken, requireStaff, [
  body('status').isIn(['OPEN', 'IN_PROGRESS', 'CLOSED'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true
          }
        },
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    // Emit status update to user
    const { io } = require('../index');
    if (ticket.userId) {
      io.to(`user-${ticket.userId}`).emit('ticket-status-updated', {
        ticketId: ticket.id,
        status
      });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add message to ticket
router.post('/tickets/:id/messages', authenticateToken, [
  body('message').notEmpty().trim(),
  body('attachments').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { message, attachments = [] } = req.body;

    // Check if ticket exists and user has access
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id,
        ...(req.user.role === 'CUSTOMER' ? { userId: req.user.id } : {})
      }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check if ticket is closed
    if (ticket.status === 'CLOSED') {
      return res.status(400).json({ error: 'Cannot send messages to closed tickets' });
    }

    // Handle file attachments
    let attachmentUrls = [];
    if (attachments && attachments.length > 0) {
      // In a real implementation, you would upload files to cloud storage
      // For now, we'll just store the file names
      attachmentUrls = attachments.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        url: `/uploads/support/${file.name}` // Mock URL
      }));
    }

    const supportMessage = await prisma.supportMessage.create({
      data: {
        ticketId: id,
        message,
        isFromAdmin: req.user.role !== 'CUSTOMER',
        attachments: attachmentUrls
      }
    });

    // Update ticket status if it was closed and customer is responding
    if (ticket.status === 'CLOSED' && req.user.role === 'CUSTOMER') {
      await prisma.supportTicket.update({
        where: { id },
        data: { status: 'OPEN' }
      });
    }

    // Emit message to relevant users
    const { io } = require('../index');
    const messageData = {
      ...supportMessage,
      ticketId: id,
      userId: ticket.userId,
      attachments: attachmentUrls
    };

    console.log('User role:', req.user.role);
    if (req.user.role === 'CUSTOMER') {
      console.log('Broadcasting customer message to admin-room');
      console.log('Message data:', messageData);
      io.to('admin-room').emit('support-message', messageData);
      console.log('Message broadcasted to admin-room');
    } else {
      console.log(`Broadcasting admin message to user-${ticket.userId}`);
      console.log('Message data:', messageData);
      io.to(`user-${ticket.userId}`).emit('support-message', messageData);
      console.log(`Message broadcasted to user-${ticket.userId}`);
    }

    res.status(201).json(supportMessage);
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get support statistics (staff only)
router.get('/stats/overview', authenticateToken, requireStaff, async (req, res) => {
  try {
    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      closedTickets,
      ticketsByPriority
    ] = await Promise.all([
      prisma.supportTicket.count(),
      prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.supportTicket.count({ where: { status: 'CLOSED' } }),
      prisma.supportTicket.groupBy({
        by: ['priority'],
        _count: { priority: true }
      })
    ]);

    res.json({
      totalTickets,
      openTickets,
      inProgressTickets,
      closedTickets,
      ticketsByPriority: ticketsByPriority.reduce((acc, item) => {
        acc[item.priority] = item._count.priority;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Get support stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add message to ticket (guest users)
router.post('/tickets/:id/messages/guest', [
  body('message').notEmpty().trim(),
  body('attachments').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { message, attachments = [] } = req.body;

    // Check if ticket exists (guest tickets have userId: null)
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id,
        userId: null // Guest ticket
      }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check if ticket is closed
    if (ticket.status === 'CLOSED') {
      return res.status(400).json({ error: 'Cannot send messages to closed tickets' });
    }

    // Handle file attachments
    let attachmentUrls = [];
    if (attachments && attachments.length > 0) {
      // In a real implementation, you would upload files to cloud storage
      // For now, we'll just store the file names
      attachmentUrls = attachments.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        url: `/uploads/support/${file.name}` // Mock URL
      }));
    }

    const supportMessage = await prisma.supportMessage.create({
      data: {
        ticketId: id,
        message,
        isFromAdmin: false, // Guest user
        attachments: attachmentUrls
      }
    });

    // Update ticket status if it was closed and guest is responding
    if (ticket.status === 'CLOSED') {
      await prisma.supportTicket.update({
        where: { id },
        data: { status: 'OPEN' }
      });
    }

    // Emit message to admin room
    const { io } = require('../index');
    const messageData = {
      ...supportMessage,
      ticketId: id,
      userId: null, // Guest user
      attachments: attachmentUrls
    };

    console.log('Broadcasting guest message to admin-room');
    io.to('admin-room').emit('support-message', messageData);

    res.status(201).json(supportMessage);
  } catch (error) {
    console.error('Add guest message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
