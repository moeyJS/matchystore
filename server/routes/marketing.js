const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require("../lib/prisma");
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();


// ===== COUPONS =====

// Get all coupons
router.get('/coupons', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'MARKETING']), async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status === 'active') {
      where.isActive = true;
      where.validFrom = { lte: new Date() };
      where.validUntil = { gte: new Date() };
    } else if (status === 'expired') {
      where.validUntil = { lt: new Date() };
    }

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.coupon.count({ where })
    ]);

    res.json({
      coupons,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create coupon
router.post('/coupons', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'MARKETING']), [
  body('code').notEmpty().withMessage('Coupon code is required'),
  body('name').notEmpty().withMessage('Coupon name is required'),
  body('type').isIn(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING']).withMessage('Invalid coupon type'),
  body('value').isFloat({ min: 0 }).withMessage('Value must be a positive number'),
  body('validFrom').isISO8601().withMessage('Valid from date is required'),
  body('validUntil').isISO8601().withMessage('Valid until date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      code,
      name,
      description,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      validFrom,
      validUntil
    } = req.body;

    // Check if code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code }
    });

    if (existingCoupon) {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        name,
        description,
        type,
        value: parseFloat(value),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil)
      }
    });

    res.status(201).json(coupon);
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update coupon
router.put('/coupons/:id', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'MARKETING']), [
  body('name').notEmpty().withMessage('Coupon name is required'),
  body('type').isIn(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING']).withMessage('Invalid coupon type'),
  body('value').isFloat({ min: 0 }).withMessage('Value must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      name,
      description,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      validFrom,
      validUntil,
      isActive
    } = req.body;

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        name,
        description,
        type,
        value: parseFloat(value),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        validFrom: validFrom ? new Date(validFrom) : undefined,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        isActive
      }
    });

    res.json(coupon);
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete coupon
router.delete('/coupons/:id', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'MARKETING']), async (req, res) => {
  try {
    await prisma.coupon.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== OFFERS =====

// Get all offers
router.get('/offers', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'MARKETING']), async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status === 'active') {
      where.isActive = true;
      where.validFrom = { lte: new Date() };
      where.validUntil = { gte: new Date() };
    } else if (status === 'expired') {
      where.validUntil = { lt: new Date() };
    }

    const [offers, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.offer.count({ where })
    ]);

    res.json({
      offers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get offers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create offer
router.post('/offers', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'MARKETING']), [
  body('title').notEmpty().withMessage('Offer title is required'),
  body('type').isIn(['PERCENTAGE', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'FREE_SHIPPING']).withMessage('Invalid offer type'),
  body('value').isFloat({ min: 0 }).withMessage('Value must be a positive number'),
  body('validFrom').isISO8601().withMessage('Valid from date is required'),
  body('validUntil').isISO8601().withMessage('Valid until date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      type,
      value,
      minOrderAmount,
      validFrom,
      validUntil
    } = req.body;

    const offer = await prisma.offer.create({
      data: {
        title,
        description,
        type,
        value: parseFloat(value),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil)
      }
    });

    res.status(201).json(offer);
  } catch (error) {
    console.error('Create offer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== NEWSLETTERS =====

// Get all newsletters
router.get('/newsletters', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'MARKETING']), async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) {
      where.status = status;
    }

    const [newsletters, total] = await Promise.all([
      prisma.newsletter.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.newsletter.count({ where })
    ]);

    res.json({
      newsletters,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get newsletters error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create newsletter
router.post('/newsletters', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'MARKETING']), [
  body('subject').notEmpty().withMessage('Subject is required'),
  body('content').notEmpty().withMessage('Content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subject, content } = req.body;

    const newsletter = await prisma.newsletter.create({
      data: {
        subject,
        content,
        status: 'DRAFT'
      }
    });

    res.status(201).json(newsletter);
  } catch (error) {
    console.error('Create newsletter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== SUBSCRIBERS =====

// Get all subscribers
router.get('/subscribers', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'MARKETING']), async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    const [subscribers, total] = await Promise.all([
      prisma.subscriber.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { subscribedAt: 'desc' }
      }),
      prisma.subscriber.count({ where })
    ]);

    res.json({
      subscribers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Subscribe to newsletter
router.post('/subscribers', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('name').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name } = req.body;

    // Check if already subscribed
    const existingSubscriber = await prisma.subscriber.findUnique({
      where: { email }
    });

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return res.status(400).json({ error: 'Email already subscribed' });
      } else {
        // Reactivate subscription
        const subscriber = await prisma.subscriber.update({
          where: { email },
          data: {
            name,
            isActive: true,
            unsubscribedAt: null
          }
        });
        return res.json(subscriber);
      }
    }

    const subscriber = await prisma.subscriber.create({
      data: {
        email,
        name,
        isActive: true
      }
    });

    res.status(201).json(subscriber);
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unsubscribe from newsletter
router.post('/subscribers/unsubscribe', [
  body('email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const subscriber = await prisma.subscriber.findUnique({
      where: { email }
    });

    if (!subscriber) {
      return res.status(404).json({ error: 'Subscriber not found' });
    }

    await prisma.subscriber.update({
      where: { email },
      data: {
        isActive: false,
        unsubscribedAt: new Date()
      }
    });

    res.json({ message: 'Successfully unsubscribed' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
