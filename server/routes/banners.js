const express = require('express');
const prisma = require("../lib/prisma");
const { requireAdmin, authenticateToken } = require('../middleware/auth');

const router = express.Router();


// Get all banners (public)
router.get('/', async (req, res) => {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
    res.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all banners (admin)
router.get('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { order: 'asc' }
    });
    res.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create banner (admin)
router.post('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl, ctaText, ctaUrl, isActive, order } = req.body;
    
    const banner = await prisma.banner.create({
      data: {
        title,
        description,
        imageUrl,
        ctaText,
        ctaUrl,
        isActive: isActive ?? true,
        order: order ?? 0
      }
    });
    
    res.status(201).json(banner);
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update banner (admin)
router.put('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, imageUrl, ctaText, ctaUrl, isActive, order } = req.body;
    
    const banner = await prisma.banner.update({
      where: { id },
      data: {
        title,
        description,
        imageUrl,
        ctaText,
        ctaUrl,
        isActive,
        order
      }
    });
    
    res.json(banner);
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete banner (admin)
router.delete('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.banner.delete({
      where: { id }
    });
    
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
