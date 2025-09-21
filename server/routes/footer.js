const express = require('express');
const prisma = require("../lib/prisma");
const { requireAdmin, authenticateToken } = require('../middleware/auth');

const router = express.Router();


// Get footer configuration (public)
router.get('/', async (req, res) => {
  try {
    const sections = await prisma.footerSection.findMany({
      where: { isActive: true },
      include: {
        links: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });

    const socialLinks = await prisma.socialLink.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });

    res.json({ sections, socialLinks });
  } catch (error) {
    console.error('Error fetching footer config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get footer configuration (admin)
router.get('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const sections = await prisma.footerSection.findMany({
      include: {
        links: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });

    const socialLinks = await prisma.socialLink.findMany({
      orderBy: { order: 'asc' }
    });

    res.json({ sections, socialLinks });
  } catch (error) {
    console.error('Error fetching footer config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create footer section (admin)
router.post('/admin/sections', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, isActive, order } = req.body;
    
    const section = await prisma.footerSection.create({
      data: {
        title,
        isActive: isActive ?? true,
        order: order ?? 0
      }
    });
    
    res.status(201).json(section);
  } catch (error) {
    console.error('Error creating footer section:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update footer section (admin)
router.put('/admin/sections/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, isActive, order } = req.body;
    
    const section = await prisma.footerSection.update({
      where: { id },
      data: { title, isActive, order }
    });
    
    res.json(section);
  } catch (error) {
    console.error('Error updating footer section:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete footer section (admin)
router.delete('/admin/sections/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.footerSection.delete({
      where: { id }
    });
    
    res.json({ message: 'Footer section deleted successfully' });
  } catch (error) {
    console.error('Error deleting footer section:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create footer link (admin)
router.post('/admin/links', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { text, url, isActive, order, sectionId } = req.body;
    
    const link = await prisma.footerLink.create({
      data: {
        text,
        url,
        isActive: isActive ?? true,
        order: order ?? 0,
        sectionId
      }
    });
    
    res.status(201).json(link);
  } catch (error) {
    console.error('Error creating footer link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update footer link (admin)
router.put('/admin/links/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, url, isActive, order } = req.body;
    
    const link = await prisma.footerLink.update({
      where: { id },
      data: { text, url, isActive, order }
    });
    
    res.json(link);
  } catch (error) {
    console.error('Error updating footer link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete footer link (admin)
router.delete('/admin/links/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.footerLink.delete({
      where: { id }
    });
    
    res.json({ message: 'Footer link deleted successfully' });
  } catch (error) {
    console.error('Error deleting footer link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create social link (admin)
router.post('/admin/social', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { platform, url, icon, isActive, order } = req.body;
    
    const socialLink = await prisma.socialLink.create({
      data: {
        platform,
        url,
        icon,
        isActive: isActive ?? true,
        order: order ?? 0
      }
    });
    
    res.status(201).json(socialLink);
  } catch (error) {
    console.error('Error creating social link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update social link (admin)
router.put('/admin/social/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { platform, url, icon, isActive, order } = req.body;
    
    const socialLink = await prisma.socialLink.update({
      where: { id },
      data: { platform, url, icon, isActive, order }
    });
    
    res.json(socialLink);
  } catch (error) {
    console.error('Error updating social link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete social link (admin)
router.delete('/admin/social/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.socialLink.delete({
      where: { id }
    });
    
    res.json({ message: 'Social link deleted successfully' });
  } catch (error) {
    console.error('Error deleting social link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
